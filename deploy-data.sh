#! /usr/bin/env sh 

set -e

./data/get_availability.py
# Direct the browser to cache the JSON for one hour
gzip --to-stdout ./data/availability.json | \
	aws s3 cp \
		- s3://lookouthunter/availability.json.gz \
		--acl public-read \
		--cache-control "public, max-age=3600, immutable"
