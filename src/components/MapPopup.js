import { Fragment } from "react";
import { Popup } from "react-map-gl";
import { formatFacilityName, reformatDate, isLikelyClosed } from "../utils";
import "./MapPopup.css";

const MapPopup = ({ location, info, onClose }) => {
  let availableDates = [];
  if (info.availability) {
    availableDates = Object.entries(info.availability)
      .filter(([_date, isAvailable]) => isAvailable)
      .map(([date, _isAvailable]) => date);
  }

  const isCurrentlyWinterSeason = [9, 10, 11, 0, 1].includes(
    new Date().getMonth(),
  );

  return (
    <Popup
      {...location}
      closeButton={false}
      closeOnClick={true}
      closeOnMove={false}
      onClose={onClose}
      tipSize={0}
      offsetTop={-10}
      anchor="bottom"
      dynamicPosition={false}
      captureScroll={true}
      maxWidth="300px"
    >
      <div className="Map-Popup">
        <span className="Map-Popup-header">
          <a
            href={`https://www.recreation.gov/camping/campgrounds/${info.metadata.facility_id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {formatFacilityName(info.metadata.facility_name)}
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
              <span>
                Available for {availableDates.length} nights over the next 6
                months:
              </span>
              <ul className="Map-Popup-list">
                {availableDates.map((date) => (
                  <li key={date}>{reformatDate(date)}</li>
                ))}
              </ul>
            </Fragment>
          )}
        </div>
      </div>
    </Popup>
  );
};

export default MapPopup;
