#! /usr/bin/env python3

import datetime
import logging
import re
import time

import dateutil.relativedelta
import lxml.html
import requests


logger = logging.getLogger(__file__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)

SECONDS_BETWEEN_REQUESTS = 0.5
REQUEST_TIMEOUT_SECONDS = 2
# recreation.gov responds with `403` errors unless the
# user agent string is spoofed to look like a browser
FAKE_USER_AGENT_HEADER = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:10.0) Gecko/20100101 Firefox/10.0'}
FORMATTING_SPACE = '    '


def get_facility_ids():
    '''
    Generate the facility IDs of all possible locations from
    the Fire Lookout rentals webpage. Follow the HTML redirect, and capture the
    ID tailing the URL, eg, `234247` from
    https://www.recreation.gov/camping/campgrounds/234247
    '''
    LISTING_URL = 'https://www.firelookout.org/lookout-rentals.html'
    listing_page = requests.get(LISTING_URL)
    listing_doc = lxml.html.fromstring(listing_page.content)
    rentals_container = listing_doc.xpath('//font[contains(text(), "Lookout Rentals by US State")]/parent::strong/parent::h2/following-sibling::div')[0]
    links = rentals_container.xpath('.//a/@href')

    for link in links:
        time.sleep(SECONDS_BETWEEN_REQUESTS)
        # As of now, at least one link on the page fails to respond:
        # http://www.gorp.com/hiking-guide/travel-ta-hiking-washington-oregon-camping-sidwcmdev_057030.html
        try:
            response = requests.get(link, headers=FAKE_USER_AGENT_HEADER, timeout=REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.Timeout:
            logger.debug("Server timed out from request to {}".format(link))
            continue
        redirected_url = response.url
        logger.debug("Redirected to {}".format(redirected_url))
        search = re.search(r'https://www\.recreation\.gov/camping/campgrounds/(\d+)', redirected_url)
        if search:
            facility_id = search.group(1)
            yield facility_id


def get_facility_metadata(facility_id):
    ''' Fetch metadata for a particular campground '''
    METADATA_URL = 'https://www.recreation.gov/api/camps/campgrounds/{facility_id}'

    time.sleep(SECONDS_BETWEEN_REQUESTS)

    campground_metadata = requests.get(
        METADATA_URL.format(facility_id=facility_id),
        headers=FAKE_USER_AGENT_HEADER
    ).json()['campground']
    logger.debug("Found metadata for {}".format(campground_metadata['facility_name']))

    return campground_metadata


def get_facility_availability(facility_id):
    ''' Fetch availability for a particular campground '''
    availabilities = {}

    AVAILABILITY_URL = 'https://www.recreation.gov/api/camps/availability/campground/{facility_id}/month?start_date={year}-{month}-01T00:00:00.000Z'

    date_to_check = datetime.date.today()
    for _ in range(6):
        time.sleep(SECONDS_BETWEEN_REQUESTS)

        logger.debug("Querying availability for facility {} for {}/{}".format(facility_id, date_to_check.month, date_to_check.year))
        response = requests.get(
            AVAILABILITY_URL.format(
                facility_id=facility_id,
                year=date_to_check.year,
                month=str(date_to_check.month).zfill(2)
            ),
            headers=FAKE_USER_AGENT_HEADER
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
    time.sleep(SECONDS_BETWEEN_REQUESTS)
    rates = requests.get(
        RATES_URL.format(facility_id=facility_id),
        headers=FAKE_USER_AGENT_HEADER
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
    NOT_AVAIALABLE_CODES = [
        'Reserved',
        'Not Reservable',
        'Not Available Cutoff'
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
        logger.info(FORMATTING_SPACE + str(filtered))
    else:
        logger.debug('No availability for {}'.format(metadata['facility_name']))


if __name__ == '__main__':
    for facility_id in get_facility_ids():
        display_facility_availability(
            get_facility_metadata(facility_id),
            get_facility_rates(facility_id),
            get_facility_availability(facility_id)
        )
