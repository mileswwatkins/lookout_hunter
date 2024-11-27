import { Fragment } from "react";
import { Popup } from "react-map-gl";
import { formatFacilityName, isLikelyClosed } from "../utils";
import DatePicker from "react-datepicker";
import "./MapPopup.css";
import "react-datepicker/dist/react-datepicker.css";
import { add } from "date-fns";

const MapPopup = ({ location, info }) => {
  let availableDates = [];
  if (info.availability) {
    availableDates = Object.entries(info.availability)
      .filter(([_date, isAvailable]) => isAvailable)
      .map(([date, _isAvailable]) => date);
  }

  const isCurrentlyWinterSeason = [9, 10, 11, 0, 1].includes(
    new Date().getMonth(),
  );

  const minDate = new Date();
  const maxDate = add(new Date(), { months: 6, days: 1 });

  return (
    <Popup
      {...location}
      closeButton={false}
      // This closing is instead handled by a handler on the map itself, which
      // is how you can switch between circles' popups without closing them
      // first
      closeOnClick={false}
      tipSize={0}
      offsetTop={-10}
      anchor="bottom"
      dynamicPosition={false}
      captureScroll={true}
      maxWidth="300px"
      // This isn't ideal for accessibility, but if this _isn't_ set to `false`
      // then the first anchor tag in the first popup that's opened gets an
      // undesirable focus/highlight in macOS Safari
      focusAfterOpen={false}
    >
      <div className="Map-Popup">
        <span className="Map-Popup-header">
          <a
            href={`https://www.recreation.gov/camping/campgrounds/${info.metadata.facility_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {formatFacilityName(info.metadata.facility_name)}
            <img
              src="link.svg"
              alt="link icon"
              className="Map-Popup-link-icon"
            ></img>
          </a>
        </span>
        <div className="Map-Popup-body">
          {isLikelyClosed(info.availability) ? (
            <span className="Map-Popup-body__unavailable">
              Facility appears to be closed
              {isCurrentlyWinterSeason
                ? ", probably just for the winter season"
                : ""}
            </span>
          ) : availableDates.length === 0 ? (
            <span className="Map-Popup-body__unavailable">
              Facility is fully booked, but to get notified of last-minute
              availability just follow the link above and click on their "🔔 Set
              Availability Alert" button
            </span>
          ) : (
            <Fragment>
              <span className="Map-Popup-body__available">
                Available for {availableDates.length} night
                {availableDates.length > 1 && "s"} over the next 6 months. Click
                on the link above to book.
              </span>
              <DatePicker
                inline
                fixedHeight
                // Helps with styling enough to be okay with the loss of
                // accessibility
                disabledKeyboardNavigation
                minDate={minDate}
                maxDate={maxDate}
                highlightDates={availableDates.map((date) => new Date(date))}
                // Don't suggest to the user that they can select anything
                selectedDates={[]}
              />
            </Fragment>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default MapPopup;
