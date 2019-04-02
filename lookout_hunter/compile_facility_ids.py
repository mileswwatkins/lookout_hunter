#! /usr/bin/env python3

import json
import logging
import os
import re
import sys
import time

import lxml.html
import requests

import config


logger = logging.getLogger(__file__)
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.INFO)


def get_firelookoutorg_ids():
    '''
    Gather the facility IDs of all possible locations from the
    Fire Lookout rentals webpage. Follow the HTML redirect, and
    capture the ID tailing the URL, eg, `234247` from
    https://www.recreation.gov/camping/campgrounds/234247
    '''
    logger.info("Fetching facility IDs from firelookout.org")

    LISTING_URL = 'https://www.firelookout.org/lookout-rentals.html'
    listing_page = requests.get(LISTING_URL)
    listing_doc = lxml.html.fromstring(listing_page.content)
    rentals_container = listing_doc.xpath('//font[contains(text(), "Lookout Rentals by US State")]/parent::strong/parent::h2/following-sibling::div')[0]
    links = rentals_container.xpath('.//a/@href')

    facility_ids = []
    for link in links:
        time.sleep(config.SECONDS_BETWEEN_REQUESTS)
        # As of now, at least one link on the page fails to respond:
        # http://www.gorp.com/hiking-guide/travel-ta-hiking-washington-oregon-camping-sidwcmdev_057030.html
        try:
            response = requests.get(link, headers=config.FAKE_USER_AGENT_HEADER, timeout=config.REQUEST_TIMEOUT_SECONDS)
        except requests.exceptions.Timeout:
            logger.debug("Server timed out from request to {}".format(link))
            continue
        redirected_url = response.url
        logger.debug("Redirected to {}".format(redirected_url))
        search = re.search(r'https://www\.recreation\.gov/camping/campgrounds/(\d+)', redirected_url)
        if search:
            facility_id = search.group(1)
            facility_ids.append(facility_id)

    logger.info("Found {} IDs".format(len(facility_ids)))
    return facility_ids


def get_recreationgov_search_ids():
    '''
    Use Recreation.gov's search interface to gather facility
    IDs that have been formally tagged as `Lookout`
    '''
    logger.info("Fetching facility IDs from the Recreation.gov search tool")

    SEARCH_URL = 'https://www.recreation.gov/api/search'
    SEARCH_PARAMS = {
        # The `fq` parameter key is used twice, which is allowed
        'fq': [
            'campsite_type:LOOKOUT',
            # Exclude non-camping overlook locations, such as
            # https://www.recreation.gov/camping/campgrounds/234489
            'campsite_type_of_use:Overnight'
        ]
    }
    # Programmatic requests without a browser-looking User Agent
    # string will receive `403` responses
    SEARCH_HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0'}

    response = requests.get(SEARCH_URL, params=SEARCH_PARAMS, headers=SEARCH_HEADERS)
    data = json.loads(response.content)
    facility_ids = [result['entity_id'] for result in data['results']]

    logger.info("Found {} IDs".format(len(facility_ids)))
    return facility_ids


def get_manually_entered_ids():
    logger.info("Reading manually-entered facility IDs")

    with open(os.path.join(sys.path[0], 'manually_entered_facility_ids.txt'), 'r') as file:
        # Need to ignore empty lines that are read as IDs
        facility_ids = [f_id for f_id in file.read().split('\n') if f_id]

    logger.info("Found {} IDs".format(len(facility_ids)))
    return facility_ids


if __name__ == '__main__':
    # Write all facility IDs to a single, newline-delimited file
    facility_ids = set(
        get_manually_entered_ids() +
        get_firelookoutorg_ids() +
        get_recreationgov_search_ids()
    )

    with open(os.path.join(sys.path[0], 'compiled_facility_ids.txt'), 'w') as file:
        # Sort the facility IDs so that it's easier to read
        # git diffs when the list changes
        file.write('\n'.join(sorted(facility_ids)))
