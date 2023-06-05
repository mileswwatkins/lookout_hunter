#! /usr/bin/env python3

import datetime
from dateutil.relativedelta import relativedelta
import json
import logging
import os
import sys
import re

from backoff import on_exception, expo
from ratelimit import limits, sleep_and_retry
import requests

import config


logger = logging.getLogger(__file__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)


# Recreation.gov throws a 403 error if too many requests are
# made. Respect this by rate-limiting this module's requests,
# and waiting before retrying upon a 403 error. Especially
# common for the availability endpoint.
def backoff_handler(details):
    logger.info('Recreation.gov returned a 403 error; going to try again after {wait:0.1f} more seconds'.format(**details))

@sleep_and_retry
@limits(calls=config.MAX_REQUESTS_PER_SECOND, period=1)
@on_exception(
    expo,
    requests.exceptions.JSONDecodeError,
    max_time=60 * 5,
    on_backoff=backoff_handler
)
def get_json_rate_limited(*args, **kwargs):
    logger.debug(f'Making a request to {args[0]}')
    response = requests.get(*args, **kwargs)
    return response.json()


def get_facility_ids():
    ''' Load facility IDs from the compiled scraped list '''
    with open(os.path.join(sys.path[0], 'compiled_facility_ids.txt'), 'r') as file:
        return file.read().split('\n')


coordinate_overrides = {
    # Meadow Peak Lookout, Montana
    '10103111': {
        'facility_latitude': 48.080,
        'facility_longitude': -114.989
    },
    # Big Hole Lookout, Montana
    '10110659': {
        'facility_latitude': 47.604,
        'facility_longitude': -115.070
    },
    # Steliko Lookout, Washington
    '10132083': {
        'facility_latitude': 47.741,
        'facility_longitude': -120.344
    },
    # Tyee Lookout, Washington
    '10132085': {
        'facility_latitude': 47.864,
        'facility_longitude': -120.471
    }
}


def get_facility_metadata(facility_id):
    ''' Fetch metadata for a particular campground '''
    METADATA_URL = 'https://www.recreation.gov/api/camps/campgrounds/{facility_id}'

    campground_metadata = get_json_rate_limited(
        METADATA_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    )['campground']

    if campground_metadata['is_deactivated']:
        logger.info("Skipping deactivated campground {}".format(campground_metadata['facility_name']))
        return None
    else:
        del campground_metadata['is_deactivated']
        logger.debug("Found metadata for {}".format(campground_metadata['facility_name']))

    # Throw out unnecessary fields, mostly internal metadata
    del campground_metadata['activated_date']
    assert campground_metadata['attributes'] is None
    del campground_metadata['attributes']
    del campground_metadata['certification_log']
    del campground_metadata['city']
    del campground_metadata['created_by']
    del campground_metadata['created_date']
    del campground_metadata['facility_time_zone']
    assert not campground_metadata['is_commercially_managed']
    del campground_metadata['is_commercially_managed']
    assert not campground_metadata['facility_lookups']
    del campground_metadata['facility_lookups']
    assert campground_metadata['inventory_type_id'] == '3'
    del campground_metadata['inventory_type_id']
    del campground_metadata['legacy_facility_id']
    assert campground_metadata['order_components'] == {
        "camping_equipment": True,
        "group_leader_details": True,
        "group_size": True,
        "num_vehicles": True,
        "pass": True
    }
    del campground_metadata['order_components']
    del campground_metadata['org_id']
    del campground_metadata['receipt_autoprint']
    assert campground_metadata['receipt_custom_text'] == ""
    del campground_metadata['receipt_custom_text']
    del campground_metadata['state']
    del campground_metadata['updated_by']
    del campground_metadata['updated_date']

    # Throw out fields that are predicable or duplicative
    # Address is just the ranger station's address
    del campground_metadata['addresses']
    if 'amenities' in campground_metadata:
        del campground_metadata['amenities']
    assert campground_metadata['facility_adaaccess'] != 'Y'
    del campground_metadata['facility_adaaccess']
    assert not campground_metadata['facility_map_url']
    del campground_metadata['facility_map_url']
    assert not campground_metadata['facility_reservation_url']
    del campground_metadata['facility_reservation_url']
    assert campground_metadata['facility_type'] == "STANDARD"
    del campground_metadata['facility_type']
    del campground_metadata['facility_use_fee_description']
    assert campground_metadata['fee_model'] == 1
    del campground_metadata['fee_model']
    assert campground_metadata['stay_limit'] == ""
    del campground_metadata['stay_limit']

    # Restructure or simplify complex fields
    campground_metadata['activities'] = [i['activity_description'] for i in campground_metadata['activities']] if campground_metadata['activities'] else []
    campground_metadata['links'] = [{'title': i['title'], 'url': i['url']} for i in campground_metadata['links']]
    assert all([i['notice_type'] == 'warning' for i in campground_metadata['notices']])
    campground_metadata['notices'] = [i['notice_text'] for i in campground_metadata['notices']] if campground_metadata['notices'] else []

    # Provide the geographic coordinates for a few shelters that are
    # missing those values
    if campground_metadata['facility_latitude'] == 0 and campground_metadata['facility_longitude'] == 0:
        coordinates = coordinate_overrides.get(campground_metadata['facility_id'])
        assert coordinates, f"Found new listing that's missing geographic coordinates and requires a manual override. `facility_id` is: {campground_metadata['facility_id']}"
        campground_metadata.update(coordinates)

    return campground_metadata


def get_campsite_availability(campsite_id):
    ''' Fetch which days a campsite is available for booking '''

    NOT_AVAIALABLE_CODES = [
        'Closed',
        'Reserved',
        'Not Reservable',
        # "Not Yet Reservable"
        'NYR',
        'Not Available',
        'Not Available Cutoff',
        # Ironic, right? This code appears to be used to describe
        # "will be open but not yet available to be booked"
        'Open'
    ]

    # The booking window is typically only 6 months into the future
    look_until = datetime.date.today() + relativedelta(months=6, days=1)

    availabilities = {}

    availability_url = f'https://www.recreation.gov/api/camps/availability/campsite/{campsite_id}/all'
    data = get_json_rate_limited(
        availability_url,
        headers=config.FAKE_USER_AGENT_HEADER
    )['availability']['availabilities']
    if data:
        availabilities = {
            # Truncate the time component off of the timestamp, and determine
            # whether a site is available on a given night
            k.replace('T00:00:00Z', ''): (v not in NOT_AVAIALABLE_CODES)
            for k, v
            in data.items()
            # Also, since this endpoint responds with months waaaaaay in the
            # future (where the availability will always be `NYR`), truncate
            # those superfluous months so the output JSON is more managable
            if not (k > look_until.isoformat() and v in NOT_AVAIALABLE_CODES)
        }
    return availabilities or None


def get_facility_rate(facility_id):
    ''' Get the nightly rate for the facility '''
    RATE_URL = 'https://www.recreation.gov/api/camps/campgrounds/{facility_id}/rates'

    logger.debug("Querying rate for facility {}".format(facility_id))
    rate = get_json_rate_limited(
        RATE_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    )

    nightly_rate = None
    for rate_info in rate.get('rates_list', []):
        assert len(rate_info['price_map']) == 1
        price = rate_info['price_map'][
            list(rate_info['price_map'].keys())[0]
        ]
        if nightly_rate is None:
            nightly_rate = price
        else:
            assert nightly_rate == price

    # This value may be `None`
    return nightly_rate


def get_cell_coverage(facility_id):
    ''' Get the aggregated ratings of cell coverage by reviewers '''
    CELL_COVERAGE_URL = 'https://www.recreation.gov/api/ratingreview/aggregate?location_type=Campground&location_id={facility_id}'

    logger.debug("Querying cell coverage for facility {}".format(facility_id))
    cell_coverage = get_json_rate_limited(
        CELL_COVERAGE_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    )

    if cell_coverage['number_of_ratings'] == 0 or \
            'aggregate_cell_coverage_ratings' not in cell_coverage:
        return None
    else:
        return cell_coverage['aggregate_cell_coverage_ratings']


def get_images(facility_id):
    ''' Get media of the location and its views '''
    IMAGE_URL = 'https://www.recreation.gov/api/media/public/asset/{facility_id}'

    logger.debug("Querying cell coverage for facility {}".format(facility_id))
    images = get_json_rate_limited(
        IMAGE_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    )

    if not images or 'result' not in images:
        return None
    else:
        images_with_minimal_info = []
        for image in images['result']:
            images_with_minimal_info.append({
                'mime_type': image['mime_type'],
                'height': int(image['height']),
                'width': int(image['width']),
                'url': image['url'],
                'description': image['description'] or image['title'],
                'credits': image['credits']
            })

        return images_with_minimal_info


def get_attributes(facility_id):
    ''' Get campground amenities and details '''
    ATTRIBUTE_URL = 'https://www.recreation.gov/api/search/campsites?fq=asset_id:{facility_id}'

    logger.debug("Querying attributes for facility {}".format(facility_id))
    attributes = get_json_rate_limited(
        ATTRIBUTE_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    )

    assert attributes['total'] < 2
    if attributes['total'] == 0 or \
            'campsites' not in attributes:
        return None
    else:
        data = {
            'details': {},
            'amenities': [],
        }

        for attribute in attributes['campsites'][0]['attributes']:
            category = attribute['attribute_category']
            name = attribute['attribute_name']
            value = parse_attribute_string(attribute['attribute_value'])

            FIELDS_TO_IGNORE = [
                'Map X Coordinate',
                'Map Y Coordinate',
                'Placed on Map',
                'Base Number of People',
                'Base Number of Vehicles'
            ]

            if name in FIELDS_TO_IGNORE:
                continue
            elif category == 'site_details':
                data['details'][name] = value
            elif category == 'equipment_details':
                data['details'][name] = value
            elif category == 'amenities':
                if name == value or \
                        (type(value) is bool and value):
                    data['amenities'].append(name)
                else:
                    data['details'][name] = value
            else:
                raise ValueError("Found unexpected attribute category: {}".format(category))

        return data


def parse_attribute_string(string):
    value = string.strip()

    if re.match(r'^\d+$', string):
        value = int(string)
    elif re.match(r'^\d+\.\d+$', string):
        value = float(string)
    elif string == 'Yes' or string == 'Y' or string == 'true':
        value = True
    elif string == 'No' or string == 'N' or string == 'false':
        value = False

    return value


def get_campsite_id(facility_id):
    '''
    Assuming there's only one campsite in the campground/facility, get
    its campsite ID
    '''

    campsites_url = f'https://www.recreation.gov/api/camps/campgrounds/{facility_id}/campsites'
    campsite_infos = get_json_rate_limited(
        campsites_url,
        headers=config.FAKE_USER_AGENT_HEADER
    )['campsites']

    assert len(campsite_infos) < 2, f"Found an unexpected number of campsites for facility ID {facility_id}"
    if len(campsite_infos) == 0:
        return None
    else:
        return campsite_infos[0]['campsite_id']


def get_campsite_metadata(campsite_id):
    '''
    Fetch a few additional metadata fields that can't be retrieved from
    the facility metadata response
    '''

    fields_to_fetch = [
        'campsite_id',
        'is_accessible',
        # This will show whether the site has electricity
        'campsite_type',
        # In the future, might be worthwhile to fetch the `campsite_longitude`
        # and `campsite_latitude` and see if they're more accurate than the
        # facility's value. Could also be nice to grab a list of all the
        # provided equipment/offerings.
    ]

    campsite_url = f'https://www.recreation.gov/api/camps/campsites/{campsite_id}'
    data = get_json_rate_limited(campsite_url, headers=config.FAKE_USER_AGENT_HEADER)['campsite']
    return {
        k: v for k, v in data.items()
        if k in fields_to_fetch
    }


if __name__ == '__main__':
    output_path = os.path.join(sys.path[0], 'availability.json')
    data = []

    for facility_id in get_facility_ids():
        metadata = get_facility_metadata(facility_id)
        if metadata is None:
            logger.info('Found no metadata for facility ID {}; skipping'.format(facility_id))
            continue
        logger.info('Fetching information for {}'.format(metadata['facility_name'].title()))

        campsite_id = get_campsite_id(facility_id)
        if campsite_id is None:
            logger.info(f'Found no campsites for {metadata["facility_name"]}; skipping')
            continue

        # Since they're not yet being used on the front-end, skip scraping
        # images and rate. We're already being rate-limited by the
        # Recreation.gov API, so decreasing the number of overall requests is
        # a good idea.
        record = {
            'metadata': {**metadata, **get_campsite_metadata(campsite_id)},
            'attributes': get_attributes(facility_id),
            # 'images': get_images(facility_id),
            'images': [],
            'cell_coverage': get_cell_coverage(facility_id),
            # 'rate': get_facility_rate(facility_id),
            'rate': None,
            'availability': get_campsite_availability(campsite_id)
        }
        if record['availability'] is None and \
                record['cell_coverage'] is None and \
                record['rate'] is None:
            logger.info("Skipping probably-closed campground {}".format(metadata['facility_name']))
            continue
        else:
            data.append(record)

    with open(output_path, 'w') as f:
        json.dump(data, f, indent=4)
