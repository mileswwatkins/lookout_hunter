#! /usr/bin/env sh

set -e

# Generate data
./data/get_availability.py
cp ./data/availability.json ./src/availability.json

# Rebuild and push the static site assets
yarn build
aws s3 cp --recursive ./build s3://lookouthunter
