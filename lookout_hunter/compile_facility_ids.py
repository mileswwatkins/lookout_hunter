#! /usr/bin/env python3

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

    return facility_ids


def get_manually_entered_ids():
    with open(os.path.join(sys.path[0], 'manually_entered_facility_ids.txt'), 'r') as file:
        return file.read().split('\n')


if __name__ == '__main__':
    # Write all facility IDs to a single, newline-delimited file
    facility_ids = set([
        lookout_id for lookout_id in
        get_manually_entered_ids() +
        get_firelookoutorg_ids()
        if lookout_id
    ])

    with open(os.path.join(sys.path[0], 'compiled_facility_ids.txt'), 'w') as file:
        # Sort the facility IDs so that it's easier to read
        # git diffs when the list changes
        file.write('\n'.join(sorted(facility_ids)))
