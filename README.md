Lookout Hunter
---

![](lookout.png)

[Fire lookout towers](https://en.wikipedia.org/wiki/Fire_lookout_tower) are scattered across the public lands, especially in the American West. Many of these towers have been decommissioned, their function replaced by satellite and areal imagery. And some of such decommissioned towers are now available to rent via recreation.gov!

Using [a list assembled by the Forest Fire Lookout Association](https://www.firelookout.org/lookout-rentals.html), the scraper in this repository finds all available rental dates over the coming months, as well as metadata such as city, state, and nightly cost. A recreation.gov URL is provided to view and book each facility.

### Requirements

- Python 3
- `libxml2`
- `pip install -r requirements.txt`

### Running

```
$ ./lookout_hunter.py
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

(Switching the logging level to `logging.DEBUG` displays additional information, such as which sites have _no_ available nights.)
