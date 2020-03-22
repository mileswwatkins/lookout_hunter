Lookout Hunter
---

![](lookout.jpg)

[Fire lookout towers](https://en.wikipedia.org/wiki/Fire_lookout_tower) are scattered across public lands in [almost every American state](http://www.nhlr.org/lookouts/), and are especially prevalent on public lands in the Mountain West. Many of these towers have been decommissioned, their function replaced by satellite and areal imagery. And some of these decommissioned towers are now available to rent via Recreation.gov!

This repository finds all available rental dates over the coming months, as well as metadata such as city, state, and nightly cost. A Recreation.gov URL is provided to view and book each facility.

### Requirements

- Python and `pip`
- `pip install -r requirements.txt`
- `libxml2`

### Running

Use `./lookout_hunter/get_availability.py` to fetch up-to-date information about sites, which will be stored in (`gitignore`'d) `./lookout_hunter/availability.json`. This JSON file is a collection of objects, with each item having this structure:

```json
{
    "metadata": {
        "activities": [
            "Wildlife Viewing",
            "Hiking",
            "Camping",
            "Historic & Cultural Site",
            "Lookout Tower",
            "Horseback Riding"
        ],
        "addresses": [
            {
                "address1": "7338 HWY. 93 S.",
                "address2": "",
                "address3": "",
                "address_type": "Default",
                "asset_address_id": "20439655",
                "city": "SULA",
                "country_code": "USA",
                "created_date": "2018-06-26T14:05:06.129Z",
                "is_deactivated": false,
                "postal_code": "59871",
                "state_code": "MT",
                "updated_date": "2018-06-26T14:05:06.129Z"
            }
        ],
        "alternate_names": "MPLT,BITTERROOT NF -FS",
        "campsites": [
            "61176"
        ],
        "cancellation_description": "",
        "facility_description_map": {
            "Facilities": "The 14-by-14 room sits 10 feet on top of the tower and can accommodate up to four people but only sleeps two. It is equipped with a bed platform for two, as well as a table and chairs, a wood stove for heat and a propane camp stove and lantern. Guests may need to saw their own firewood from down and dead material surrounding the lookout, and a bow saw and axe are provided. Basic eating and cooking utensils are available and an outdoor vault toilet is provided. A 30-inch catwalk surrounds the tower's single, glass-paneled room\n\nThe lookout is built on a 10 foot tall tower, with narrow steps and catwalk.  This may pose a hazard for children and pets.  Guests are responsible for their own safety. \n  \nGuests will need to bring their own water for drinking, cooking and cleaning purposes, as well as propane fuel canisters for cooking and lighting. Guests are also responsible for their own bedding, towels, soap, toilet paper and garbage bags. The facility does not provide trash receptacles; all garbage must be carried out, and the tower must be cleaned by guests prior to leaving. \n  \nThe tower is accessed by a somewhat difficult 3.5-mile hike from the parking area with a 2,000 foot elevation gain. Snowmobiles and other off-road vehicles are not allowed on the trail, however, horses and other livestock are welcome. Guests are responsible for their own travel arrangements and safety, and must bring several of their own amenities.",
            "Natural Features": "The tower is poised between the east and west forks of the Bitterroot River at an elevation of 8,409 feet. It offers beautiful views of the Bitterroot Mountains, as well as a vista of the southern Bitterroot Valley to the east. On clear nights the lights of Hamilton can be seen from the tower.\n<br/><br/>\nThe Bitterroot forest is home to many species of wildlife, from mule deer, whitetail deer, elk, bighorn sheep, mountain goats, black bear, mountain lions and moose to many varieties of smaller animals and birds. ",
            "Overview": "Medicine Point Lookout is a historic tower located on Medicine Point, west of Sula. It has been restored to reflect a lookout of the 1940s, including the stove, furniture, dishes and other small touches. It offers a unique chance for visitors to camp on a mountain peak, near the scenic Bitterroot River in a rustic, old-time setting, while having the enjoyment of recreating on public lands. The tower provides spectacular views of the surrounding western Montana wilderness.\n",
            "Recreation": "An extensive trail system exists in the area, including several loop trails for hiking, backpacking and horseback riding. Hitching racks are available at the base of the tower for equestrian campers' needs. Road and trail conditions are unpredictable, as weather changes quickly in the area. For best results, consult the ranger district prior to travel.\n<br/><br/>\nAside from hiking and horseback riding, the area is replete with wildlife and offers scenic views. A lookout journal is kept inside, providing instructions of what to do in case of emergency or a storm. Danger from lightning is largely abated due to a lightning rod implanted at the structure.\n"
        },
        "facility_directions": "From Missoula, Montana, travel south on Highway 93 to Laird Creek Road/Forest Service Road 370, which is approximately 34 miles south of Hamilton. Turn right and continue about 4 miles to Bear Creek Saddle. At Bear Creek Saddle, turn north onto Forest Service Road 5731 and continue 2 miles to the trailhead. The trail to the tower is approximately 3.5 miles and is quite steep along some portions, gaining 2,000 feet of elevation. ",
        "facility_email": "",
        "facility_id": "234296",
        "facility_latitude": 45.8072222,
        "facility_longitude": -114.1102778,
        "facility_name": "MEDICINE POINT LOOKOUT",
        "facility_phone": "406-821-3913",
        "facility_rules": {
            "maxConsecutiveStay": {
                "description": "",
                "end_date": "2050-12-31T00:00:00Z",
                "secondary_value": "",
                "start_date": "2007-07-24T00:00:00Z",
                "units": "",
                "value": 14
            },
            "reservationCutOff": {
                "description": "",
                "end_date": "2100-01-01T00:00:00Z",
                "secondary_value": "",
                "start_date": "0001-01-01T00:00:00Z",
                "units": "",
                "value": 4
            }
        },
        "facility_time_zone": "",
        "links": [
            {
                "title": "Montana State Tourism",
                "url": "http://www.visitmt.com"
            },
            {
                "title": "Montana State Road Conditions",
                "url": "http://www.mdt.mt.gov"
            }
        ],
        "notices": [
            {
                "type": "warning",
                "text": "Drinking water is not available"
            },
            {
                "type": "warning",
                "text": "Bring propane canisters for stove and lantern"
            },
            {
                "type": "warning",
                "text": "This facility is located in a remote area; before making a reservation, become aware of <a href=\"http://www.fws.gov/mountain-prairie/species/mammals/grizzly/fact_sheets.htm\" rel=\"nofollow\">bear</a>, <a href=\"http://www.fs.usda.gov/Internet/FSE_DOCUMENTS/stelprdb5050431.pdf\" rel=\"nofollow\">water</a> and <a href=\"http://www.wrh.noaa.gov/mso/\" rel=\"nofollow\">weather</a> safety"
            },
            {
                "type": "warning",
                "text": "All garbage and food must be packed out"
            },
            {
                "type": "warning",
                "text": "The lookout remains locked; a week before your scheduled arrival, contact the Darby-Sula Ranger District during  office hours (Mon-Fri 8:00 a.m to 4:30 p.m.)  to obtain a key code"
            },
            {
                "type": "warning",
                "text": "Learn more about the <a href=\"http://www.fs.usda.gov/bitterroot/\" rel=\"nofollow\">Bitterroot National Forest</a>"
            },
            {
                "type": "warning",
                "text": "<b>Don't Move Firewood:</b> Prevent the spread of tree-killing pests by obtaining firewood near your destination and burning it on-site. For more information visit <a href=\"http://www.dontmovefirewood.org/\" rel=\"nofollow\"> dontmovefirewood.org.</a>"
            },
            {
                "type": "warning",
                "text": "The historic L-4 cabin sits on top of a 10 foot tall tower, with narrow steps and catwalk.  This may pose a hazard for children and pets.  Guests are responsible for their own safety."
            }
        ],
        "org_code": "FS",
        "parent_asset_id": "1014"
    },
    "attributes": {
        "details": {
            "Num of Rooms": 1,
            "Pets Allowed": false,
            "Site Access": "Hike-In",
            "Checkin Time": "2:00 PM",
            "Checkout Time": "12:00 PM",
            "Hike In Distance to Site": 3.5,
            "Max Num of People": 4,
            "Min Num of People": 1,
            "Bed Type": "Single",
            "Capacity/Size Rating": "N/A",
            "Num of Beds": 1,
            "Max Num of Vehicles": 0,
            "Max Vehicle Length": 0
        },
        "amenities": [
            "Cooking Utensils",
            "Cooking Pots",
            "Hitching Racks",
            "Outhouse",
            "Propane Lantern (Fuel not provided)",
            "Table & Chairs",
            "Twin Bed Platform",
            "Wood Stove"
        ]
    },
    "images": [
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72544.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        },
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72672.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        },
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72585.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        },
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72613.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        },
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72596.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        },
        {
            "mime_type": "image/jpeg",
            "height": 360,
            "width": 540,
            "url": "https://cdn.recreation.gov/public/images/72692.jpg",
            "description": "MEDICINE POINT LOOKOUT",
            "credits": ""
        }
    ],
    "cell_coverage": [
        {
            "average_rating": 3,
            "carrier": "Verizon",
            "number_of_ratings": 1
        }
    ],
    "rate": 30,
    "availability": {
        "2020-06-30": false,
        "2020-07-01": false,
        "2020-07-02": false,
        "2020-07-03": false,
        "2020-07-04": false,
        "2020-07-05": false,
        "2020-07-06": false,
        "2020-07-07": false,
        "2020-07-08": false,
        "2020-07-09": false,
        "2020-07-10": false,
        "2020-07-11": false,
        "2020-07-12": false,
        "2020-07-13": false,
        "2020-07-14": false,
        "2020-07-15": false,
        "2020-07-16": false,
        "2020-07-17": false,
        "2020-07-18": false,
        "2020-07-19": false,
        "2020-07-20": false,
        "2020-07-21": false,
        "2020-07-22": false,
        "2020-07-23": false,
        "2020-07-24": false,
        "2020-07-25": false,
        "2020-07-26": false,
        "2020-07-27": false,
        "2020-07-28": false,
        "2020-07-29": false,
        "2020-07-30": false,
        "2020-07-31": false,
        "2020-08-01": false,
        "2020-08-02": true,
        "2020-08-03": false,
        "2020-08-04": true,
        "2020-08-05": true,
        "2020-08-06": true,
        "2020-08-07": false,
        "2020-08-08": false,
        "2020-08-09": false,
        "2020-08-10": true,
        "2020-08-11": false,
        "2020-08-12": false,
        "2020-08-13": false,
        "2020-08-14": false,
        "2020-08-15": false,
        "2020-08-16": true,
        "2020-08-17": true,
        "2020-08-18": false,
        "2020-08-19": false,
        "2020-08-20": true,
        "2020-08-21": false,
        "2020-08-22": false,
        "2020-08-23": true,
        "2020-08-24": true,
        "2020-08-25": true,
        "2020-08-26": false,
        "2020-08-27": true,
        "2020-08-28": false,
        "2020-08-29": false,
        "2020-08-30": false,
        "2020-08-31": true,
        "2020-09-01": false,
        "2020-09-02": false,
        "2020-09-03": true,
        "2020-09-04": false,
        "2020-09-05": false,
        "2020-09-06": false,
        "2020-09-07": true,
        "2020-09-08": true,
        "2020-09-09": true,
        "2020-09-10": true
    }
}
```

### Contributing `facility_id`s

All currently-known Recreation.gov `facility_id`s for this project are stored within `compiled_facility_ids.txt`. If you know of any _additional_ IDs, please add them!

- If they're one-off additions, simply add them to the `lookout_hunter/manually_entered_facility_ids.txt` file, one ID per line, with a comment (starting with `#`) on where the IDs were sourced from
- If you have an entirely new data source, you can add a scraper for that in `lookout_hunter/compile_facility_ids.py`, and commit any changes to the `lookout_hunter/compiled_facility_ids.txt` file as well. Alternatively, if you're not comfortable writing a Python scraper, you can let me know about the data source by [filing a GitHub Issue](https://github.com/mileswwatkins/lookout_hunter/issues)!
