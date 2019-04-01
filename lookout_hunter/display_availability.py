#! /usr/bin/env python3

import datetime
import logging
import os
import sys
import time

import dateutil.relativedelta
import requests

import config


logger = logging.getLogger(__file__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)


def get_facility_ids():
    ''' Load facility IDs from the compiled scraped list '''
    with open(os.path.join(sys.path[0], 'compiled_facility_ids.txt'), 'r') as file:
        return file.read().split('\n')


def get_facility_metadata(facility_id):
    ''' Fetch metadata for a particular campground '''
    METADATA_URL = 'https://www.recreation.gov/api/camps/campgrounds/{facility_id}'

    time.sleep(config.SECONDS_BETWEEN_REQUESTS)

    campground_metadata = requests.get(
        METADATA_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    ).json()['campground']
    logger.debug("Found metadata for {}".format(campground_metadata['facility_name']))

    return campground_metadata


def get_facility_availability(facility_id):
    ''' Fetch availability for a particular campground '''
    availabilities = {}

    AVAILABILITY_URL = 'https://www.recreation.gov/api/camps/availability/campground/{facility_id}/month?start_date={year}-{month}-01T00:00:00.000Z'

    date_to_check = datetime.date.today()
    MONTHS_TO_LOOK_AHEAD = 7
    for _ in range(MONTHS_TO_LOOK_AHEAD):
        time.sleep(config.SECONDS_BETWEEN_REQUESTS)

        logger.debug("Querying availability for facility {} for {}/{}".format(facility_id, date_to_check.month, date_to_check.year))
        response = requests.get(
            AVAILABILITY_URL.format(
                facility_id=facility_id,
                year=date_to_check.year,
                month=str(date_to_check.month).zfill(2)
            ),
            headers=config.FAKE_USER_AGENT_HEADER
        )

        campsites = response.json()['campsites']
        # Since these are special-case campgrounds for
        # recreation.gov, they all have just a single campsite
        campsite_id = list(campsites.keys())[0]
        month_availabilities = campsites[campsite_id]['availabilities']
        datetime_availabilities = {datetime.datetime.strptime(k, '%Y-%m-%dT00:00:00Z'): v for k, v in month_availabilities.items()}
        availabilities.update(datetime_availabilities)

        # Prepare to query the next month
        date_to_check = date_to_check + dateutil.relativedelta.relativedelta(months=1)

    return availabilities


def get_facility_rates(facility_id):
    ''' Get the range of nightly rates for the facility '''
    RATES_URL = 'https://www.recreation.gov/api/camps/campgrounds/{facility_id}/rates'

    logger.debug("Querying rates for facility {}".format(facility_id))
    time.sleep(config.SECONDS_BETWEEN_REQUESTS)
    rates = requests.get(
        RATES_URL.format(facility_id=facility_id),
        headers=config.FAKE_USER_AGENT_HEADER
    ).json()

    min_rate = None
    max_rate = None
    for rate in rates['rates_list']:
        cost = rate['price_map'][list(rate['price_map'].keys())[0]]
        if min_rate is None or cost < min_rate:
            min_rate = cost
        if max_rate is None or cost > max_rate:
            max_rate = cost

    return (min_rate, max_rate)


def display_facility_availability(metadata, rates, availability):
    ''' Display dates available for a site, in an easily-digestable format '''
    FORMATTING_SPACE = '    '
    NOT_AVAIALABLE_CODES = [
        'Reserved',
        'Not Reservable',
        'Not Available',
        'Not Available Cutoff',
        # Ironic, right? This code appears to be used to describe
        # "will be open but not yet available to be booked"
        'Open'
    ]

    try:
        min_consecutive_stay = metadata['facility_rules']['minConsecutiveStay']['value']
    except KeyError:
        min_consecutive_stay = 1
    # We'd need more complex logic if this number was higher than 2
    assert min_consecutive_stay <= 2

    filtered = []
    for day, code in availability.items():
        if code in NOT_AVAIALABLE_CODES:
            continue
        elif min_consecutive_stay == 2 and \
                availability[day - datetime.timedelta(days=1)] in NOT_AVAIALABLE_CODES and \
                availability[day + datetime.timedelta(days=1)] in NOT_AVAIALABLE_CODES:
            continue
        else:
            filtered.append(day.strftime('%b %d'))

    if filtered:
        logger.info('Found available dates for {}'.format(metadata['facility_name'].title()))
        logger.info(FORMATTING_SPACE + 'https://www.recreation.gov/camping/campgrounds/{}'.format(metadata['facility_id']))
        if metadata['addresses'][0]['city']:
            logger.info(FORMATTING_SPACE + '{}, {}'.format(
                metadata['addresses'][0]['city'].title(),
                metadata['addresses'][0]['state_code']
            ))
        else:
            logger.info(FORMATTING_SPACE + metadata['addresses'][0]['state_code'])
        if rates[0] == rates[1]:
            logger.info(FORMATTING_SPACE + '${} per night'.format(rates[0]))
        else:
            logger.info(FORMATTING_SPACE + '${}-{} per night'.format(rates[0], rates[1]))
        logger.info(FORMATTING_SPACE + str(filtered) + '\n')
    else:
        logger.debug('No availability for {}'.format(metadata['facility_name']))


if __name__ == '__main__':
    for facility_id in get_facility_ids():
        display_facility_availability(
            get_facility_metadata(facility_id),
            get_facility_rates(facility_id),
            get_facility_availability(facility_id)
        )
