import { add, parse, format, isValid } from "date-fns";
import React, { Component, Fragment } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./App.css";

const parseAvailabilityDate = (dateString) =>
  parse(dateString, "yyyy-MM-dd", new Date());

const reformatDate = (dateString) => {
  const date = parseAvailabilityDate(dateString);
  return format(date, "MMMM d (E)");
};

const formatFacilityName = (name) => {
  return (
    name
      // A few sites have ` RENTAL` at the end of their names,
      // which is redundant
      .replace(/ RENTAL$/, "")
      .replace("MTN.", "MOUNTAIN")
      .replace("MT.", "MOUNT")
      // There are a few remaining periods that don't make sense
      .replace(". ", " ")
  );
};

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popup: { ...this.initialPopupState },
      filters: { ...this.initialFiltersState },
      data: [],
    };
  }

  initialPopupState = {
    visible: false,
    info: null,
    location: {
      latitude: null,
      longitude: null,
    },
  };

  initialFiltersState = {
    consecutiveDays: 1,
    afterDate: new Date(),
    // Availability windows are typically only 6 months into
    // the future
    beforeDate: add(new Date(), { months: 6 }),
    carAccess: false,
    cellCarrier: "",
  };

  componentDidMount = () => {
    fetch("https://lookouthunter.s3.amazonaws.com/availability.json")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ data });
      });
  };

  onChangeConsecutiveDays = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        consecutiveDays: e.target.value,
      },
    });
  };

  onChangeAfterDate = (afterDate) => {
    this.setState({
      filters: {
        ...this.state.filters,
        afterDate,
      },
    });
  };

  onChangeBeforeDate = (beforeDate) => {
    this.setState({
      filters: {
        ...this.state.filters,
        beforeDate,
      },
    });
  };

  onChangeCellCarrier = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        cellCarrier: e.target.value,
      },
    });
  };

  onChangeCarAccess = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        carAccess: e.target.checked,
      },
    });
  };

  onReset = (e) => {
    e.preventDefault();
    this.setState({
      filters: {
        ...this.initialFiltersState,
      },
    });
  };

  render() {
    if (!this.state.data.length) {
      return "";
    }

    const consecutiveDaysMax = Math.max(
      ...this.state.data
        .filter((i) => i.metadata.facility_rules.maxConsecutiveStay)
        .map((i) => i.metadata.facility_rules.maxConsecutiveStay.value)
    );

    const beforeDateMin = this.state.filters.afterDate || new Date();
    const beforeDateMax = add(new Date(), { months: 6 });

    const allCellCarriers = this.state.data
      .reduce((acc, i) => {
        if (i.cell_coverage !== null) {
          i.cell_coverage.forEach((j) => {
            const carrier = j.carrier;
            if (!acc.includes(carrier)) {
              acc = acc.concat(carrier);
            }
          });
        }
        return acc;
      }, [])
      .sort();

    return (
      <Fragment>
        <form onSubmit={(e) => e.preventDefault()}>
          <label>
            After date:{"\u00A0"}
            <DatePicker
              selected={this.state.filters.afterDate}
              onChange={this.onChangeAfterDate}
              minDate={new Date()}
              maxDate={this.state.filters.beforeDate}
              dateFormat="MMMM d"
            />
          </label>

          <label>
            Before date:{"\u00A0"}
            <DatePicker
              selected={this.state.filters.beforeDate}
              onChange={this.onChangeBeforeDate}
              minDate={beforeDateMin}
              maxDate={beforeDateMax}
              dateFormat="MMMM d"
            />
          </label>

          <label>
            Has <i>X</i> consecutive days available:{"\u00A0"}
            <input
              type="number"
              min={1}
              max={consecutiveDaysMax}
              step={1}
              value={this.state.filters.consecutiveDays}
              onChange={this.onChangeConsecutiveDays}
            ></input>
          </label>

          <label>
            Has cell reception from carrier:{"\u00A0"}
            <select
              value={this.state.filters.cellCarrier}
              onChange={this.onChangeCellCarrier}
            >
              <option value=""></option>
              {allCellCarriers.map((i) => (
                <option value={i} key={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>

          {/* <label>
            Accessible by car:{"\u00A0"}
            <input
              type="checkbox"
              name="accessibleByCar"
              checked={this.state.filters.carAccess}
              onChange={this.onChangeCarAccess}
            ></input>
          </label> */}

          <input
            type="reset"
            value="Reset filters"
            onClick={this.onReset}
          ></input>
        </form>

        <ReactMapGL
          initialViewState={{
            latitude: 45,
            longitude: -118,
            zoom: 4.5,
          }}
          style={{
            width: "100vw",
            height: "85vh",
          }}
          mapStyle="mapbox://styles/mapbox/outdoors-v11"
          mapboxAccessToken="pk.eyJ1IjoibWlsZXN3d2F0a2lucyIsImEiOiJjazgzeHRzZ2kxaDF3M2VwYXVpam1jdnphIn0.l2i1tiNOOQy2QsOPKrKNNg"
        >
          {this.state.data.map((i) => (
            <Marker
              key={i.metadata.facility_name}
              latitude={i.metadata.facility_latitude}
              longitude={i.metadata.facility_longitude}
            >
              <div
                className={
                  "Map-circle " +
                  (i.metadata.facility_latitude ===
                    this.state.popup.location.latitude &&
                  i.metadata.facility_longitude ===
                    this.state.popup.location.longitude
                    ? "Map-circle__selected "
                    : "") +
                  (i.availability !== null &&
                  Object.values(i.availability).some((v) => v) &&
                  (!this.state.filters.consecutiveDays ||
                    (!isNaN(this.state.filters.consecutiveDays) &&
                      i.availability !== null &&
                      Object.values(i.availability).reduce(
                        (accumulator, _, index, array) => {
                          return (
                            accumulator ||
                            (index - (this.state.filters.consecutiveDays - 1) >=
                              0 &&
                              array
                                .slice(
                                  index -
                                    (this.state.filters.consecutiveDays - 1),
                                  index + 1
                                )
                                .every((v) => v))
                          );
                        },
                        false
                      ))) &&
                  (!this.state.filters.afterDate ||
                    (isValid(this.state.filters.afterDate) &&
                      Object.entries(i.availability)
                        .filter(([date, availability]) => availability)
                        .some(
                          ([date]) =>
                            parseAvailabilityDate(date) >=
                            this.state.filters.afterDate
                        ))) &&
                  (!this.state.filters.beforeDate ||
                    (isValid(this.state.filters.beforeDate) &&
                      Object.entries(i.availability)
                        .filter(([date, availability]) => availability)
                        .some(
                          ([date]) =>
                            parseAvailabilityDate(date) <=
                            this.state.filters.beforeDate
                        ))) &&
                  (!this.state.filters.cellCarrier ||
                    (i.cell_coverage !== null &&
                      i.cell_coverage.find(
                        (j) => j.carrier === this.state.filters.cellCarrier
                      ) &&
                      // 3 out of 4 is a rating of "good"
                      i.cell_coverage.find(
                        (j) => j.carrier === this.state.filters.cellCarrier
                      ).average_rating >= 3)) &&
                  (!this.state.filters.carAccess ||
                    (i.attributes !== null &&
                      i.attributes.details !== null &&
                      (i.attributes.details["Site Access"] === "Drive-In" ||
                        i.attributes.details["Max Num of Vehicles"] > 0 ||
                        i.attributes.details["Min Num of Vehicles"] > 0 ||
                        i.attributes.details["Driveway Grade"] ||
                        i.attributes.details["Driveway Surface"] ||
                        i.attributes.details["Driveway Entry"] ||
                        i.attributes.details["Max Vehicle Length"] > 0 ||
                        i.attributes.details["Hike In Distance to Site"] ===
                          0)))
                    ? "Map-circle__active "
                    : "Map-circle__inactive ")
                }
                onClick={(e) => {
                  this.setState({
                    popup: {
                      visible: true,
                      info: i,
                      location: {
                        latitude: i.metadata.facility_latitude,
                        longitude: i.metadata.facility_longitude,
                      },
                    },
                  });
                }}
              ></div>
            </Marker>
          ))}

          {this.state.popup.visible && (
            <Popup
              {...this.state.popup.location}
              closeOnClick={false}
              closeButton={true}
              onClose={() =>
                this.setState({ popup: { ...this.initialPopupState } })
              }
              tipSize={0}
              offsetTop={-10}
              anchor="bottom"
              dynamicPosition={false}
              captureScroll={true}
            >
              <div className="Map-Popup">
                <span className="Map-Popup-header">
                  <a
                    href={`https://www.recreation.gov/camping/campgrounds/${this.state.popup.info.metadata.facility_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatFacilityName(
                      this.state.popup.info.metadata.facility_name
                    )}
                  </a>
                </span>
                <div className="Map-Popup-body">
                  {this.state.popup.info.availability === null ||
                  Object.keys(this.state.popup.info.availability).length ===
                    0 ? (
                    <span className="Map-Popup-body__unavailable">
                      Facility appears to be closed
                    </span>
                  ) : Object.values(this.state.popup.info.availability).every(
                      (v) => !v
                    ) ? (
                    <span className="Map-Popup-body__unavailable">
                      No availability found
                    </span>
                  ) : (
                    <Fragment>
                      <span>Available for {this.state.popup.info.availability.filter(([date, isAvailable]) => isAvailable).length} total days:</span>
                      <ul className="Map-Popup-list">
                        {Object.entries(this.state.popup.info.availability)
                          .filter(([date, isAvailable]) => isAvailable)
                          .map(([date, isAvailable]) => (
                            <li key={date}>{reformatDate(date)}</li>
                          ))}
                      </ul>
                    </Fragment>
                  )}
                </div>
              </div>
            </Popup>
          )}
        </ReactMapGL>
      </Fragment>
    );
  }
}

export default App;
