Lookout Hunter
---

![](lookout.jpg)

[Fire lookout towers](https://en.wikipedia.org/wiki/Fire_lookout_tower) are scattered across the public lands, especially in the American West. Many of these towers have been decommissioned, their function replaced by satellite and areal imagery. And some of such decommissioned towers are now available to rent via Recreation.gov!

This repository finds all available rental dates over the coming months, as well as metadata such as city, state, and nightly cost. A Recreation.gov URL is provided to view and book each facility.

### Requirements

- Python 3
- `libxml2`
- `pip install -r requirements.txt`

### Running

```
$ ./lookout_hunter/display_availability.py
Found available dates for Castle Butte Lookout
    https://www.recreation.gov/camping/campgrounds/234325
    Kooskia, ID
    $45 per night
    ['Jul 31']

Found available dates for Shorty Peak Lookout
    https://www.recreation.gov/camping/campgrounds/234386
    Bonners Ferry, ID
    $45 per night
    ['Jul 15', 'Jul 16', 'Jul 17', 'Jul 18']

Found available dates for Black Mountain Lookout
    https://www.recreation.gov/camping/campgrounds/233296
    Blairsden, CA
    $60 per night
    ['Jun 22', 'Jun 23', 'Jun 24', 'Jun 27', 'Jun 28', 'Jun 29', 'Jun 30']

...
```

_Switching the logging level to `logging.DEBUG` displays additional information, such as which sites have _no_ available nights._

### Contributing `facility_id`s

All currently-known Recreation.gov `facility_id`s for this project are stored within `compiled_facility_ids.txt`. If you know of any _additional_ IDs, please add them!

- If they're one-off additions, simply add them to the `lookout_hunter/manually_entered_facility_ids.txt` file, one ID per line
- If you have an entirely new data source, you can add a scraper for that in `lookout_hunter/compile_facility_ids.py`. Alternatively, if you're not comfortable writing a Python scraper, you can let me know about the data source by [filing a GitHub Issue](https://github.com/mileswwatkins/lookout_hunter/issues)!
