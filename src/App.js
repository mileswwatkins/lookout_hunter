import { add, sub } from "date-fns";
import React, { Component, Fragment } from "react";
import ReactMapGL, { Marker, Popup } from "react-map-gl";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { checkFilters } from "./filters";
import { formatFacilityName, reformatDate, isLikelyClosed } from "./utils";
import "./App.css";

const Filters = ({
  afterDate,
  onChangeAfterDate,
  beforeDate,
  onChangeBeforeDate,
  consecutiveDaysMax,
  consecutiveDays,
  onChangeConsecutiveDays,
  allCellCarriers,
  cellCarrier,
  onChangeCellCarrier,
  carAccess,
  onChangeCarAccess,
  electricity,
  onChangeElectricity,
  accessible,
  onChangeAccessible,
  onReset,
}) => {
  const beforeDateMin = add(afterDate || new Date(), { days: 1 });
  // Availability windows are typically only 6 months into
  // the future
  const beforeDateMax = add(new Date(), { months: 6, days: 1 });

  const afterDateMin = new Date();
  const afterDateMax = sub(beforeDate || beforeDateMax, { days: 1 });

  return (
    <section className="Filters">
      <div className="Filters-Header">
        <h2 className="Filters-Header-Label">Filters</h2>
        <input
          type="reset"
          className="Filters-Header-Reset"
          value="Reset filters"
          onClick={onReset}
        ></input>
      </div>

      <form onSubmit={(e) => e.preventDefault()}>
        <label>
          After date:{"\u00A0"}
          <DatePicker
            selected={afterDate}
            onChange={onChangeAfterDate}
            minDate={afterDateMin}
            maxDate={afterDateMax}
            dateFormat="MMMM d"
            className="Filter-Label-Text"
          />
        </label>

        <label>
          Before date:{"\u00A0"}
          <DatePicker
            selected={beforeDate}
            onChange={onChangeBeforeDate}
            minDate={beforeDateMin}
            maxDate={beforeDateMax}
            dateFormat="MMMM d"
            className="Filter-Label-Text"
          />
        </label>

        <label>
          How many consecutive days:{"\u00A0"}
          <input
            type="number"
            min={1}
            max={consecutiveDaysMax}
            step={1}
            value={consecutiveDays}
            onChange={onChangeConsecutiveDays}
          ></input>
        </label>

        <label>
          Has cell reception from carrier:{"\u00A0"}
          <select value={cellCarrier} onChange={onChangeCellCarrier}>
            <option value=""></option>
            {allCellCarriers.map((i) => (
              <option value={i} key={i}>
                {i}
              </option>
            ))}
          </select>
        </label>

        <label>
          Has electricity:{"\u00A0"}
          <input
            type="checkbox"
            checked={electricity}
            onChange={onChangeElectricity}
          ></input>
        </label>

        <label>
          Accessible by car:{"\u00A0"}
          <input
            type="checkbox"
            checked={carAccess}
            onChange={onChangeCarAccess}
          ></input>
        </label>

        <label>
          ADA accessible:{"\u00A0"}
          <input
            type="checkbox"
            checked={accessible}
            onChange={onChangeAccessible}
          ></input>
        </label>
      </form>
    </section>
  );
};

const MapPopup = ({ location, info, onClose }) => {
  let availableDates = [];
  if (info.availability) {
    availableDates = Object.entries(info.availability)
      .filter(([date, isAvailable]) => isAvailable)
      .map(([date, isAvailable]) => date);
  }

  const isCurrentlyWinterSeason = [9, 10, 11, 0, 1].includes(
    new Date().getMonth()
  );

  return (
    <Popup
      {...location}
      closeOnClick={false}
      closeButton={true}
      onClose={onClose}
      tipSize={0}
      offsetTop={-10}
      anchor="bottom"
      dynamicPosition={false}
      captureScroll={true}
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
              availability just follow the link above and click the 🔔 button
            </span>
          ) : (
            <Fragment>
              <span>Available for {availableDates.length} total days:</span>
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

class Map extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popup: this.initialPopupState,
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

  render() {
    return (
      <ReactMapGL
        initialViewState={{
          latitude: 42,
          longitude: -115,
          zoom: 4.5,
        }}
        style={{
          width: "100%",
          // This is still a hack, but represents the full page height minus
          // the header text and padding and the hairline border between panes
          height: "calc(100vh - 38px - 2rem - 1px)",
        }}
        mapStyle="mapbox://styles/mapbox/outdoors-v12"
        mapboxAccessToken="pk.eyJ1IjoibWlsZXN3d2F0a2lucyIsImEiOiJjbG0xcXl5cngzNnFyM2twaXk4cG83NXFyIn0.420VQRr7GT87ST-4uJ_9nA"
      >
        {this.props.data.map((i) => (
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
                (checkFilters(i, this.props.filters)
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
          <MapPopup
            {...this.state.popup}
            onClose={() =>
              this.setState({ popup: { ...this.initialPopupState } })
            }
          />
        )}
      </ReactMapGL>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popup: { ...this.initialPopupState },
      filters: { ...this.initialFiltersState },
      data: [],
    };

    this.onChangeAfterDate = this.onChangeAfterDate.bind(this);
    this.onChangeBeforeDate = this.onChangeBeforeDate.bind(this);
    this.onChangeConsecutiveDays = this.onChangeConsecutiveDays.bind(this);
    this.onChangeCellCarrier = this.onChangeCellCarrier.bind(this);
    this.onChangeElectricity = this.onChangeElectricity.bind(this);
    this.onChangeCarAccess = this.onChangeCarAccess.bind(this);
    this.onChangeAccessible = this.onChangeAccessible.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  initialFiltersState = {
    consecutiveDays: 1,
    afterDate: null,
    beforeDate: null,
    cellCarrier: "",
    electricity: false,
    carAccess: false,
    accessible: false,
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
        consecutiveDays: Number(e.target.value),
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

  onChangeElectricity = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        electricity: e.target.checked,
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

  onChangeAccessible = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        accessible: e.target.checked,
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
        <header>
          <img
            src="logo.svg"
            alt="the silhouette of a fire lookout tower"
            className="Header-Logo"
          ></img>
          <div className="Header-Text">
            <h1 className="Header-Title">Lookout Hunter</h1>
            <span className="Header-Explainer">
              <a
                href="https://github.com/mileswwatkins/lookout_hunter#lookout-hunter"
                rel="noreferrer"
                target="_blank"
              >
                (Wait, what's a lookout?)
              </a>
            </span>
          </div>
        </header>

        <section className="Content">
          <div className="Content-FilterPane">
            <Filters
              {...this.state.filters}
              consecutiveDaysMax={consecutiveDaysMax}
              allCellCarriers={allCellCarriers}
              onChangeAfterDate={this.onChangeAfterDate}
              onChangeBeforeDate={this.onChangeBeforeDate}
              onChangeConsecutiveDays={this.onChangeConsecutiveDays}
              onChangeCellCarrier={this.onChangeCellCarrier}
              onChangeElectricity={this.onChangeElectricity}
              onChangeCarAccess={this.onChangeCarAccess}
              onChangeAccessible={this.onChangeAccessible}
              onReset={this.onReset}
            />

            <div>
              <span className="Content-Attribution">
                With ♥,{" "}
                <a
                  href="http://mileswwatkins.com"
                  rel="noreferrer"
                  target="_blank"
                >
                  Miles Watkins
                </a>
              </span>
              <span className="Content-Attribution">
                <a
                  href="https://github.com/mileswwatkins/lookout_hunter"
                  rel="noreferrer"
                  target="_blank"
                >
                  Code on GitHub
                </a>
              </span>
              <span className="Content-Attribution">
                Logo based on work by{" "}
                <a href="https://thenounproject.com/icon/watchtower-1247287/">
                  Creative Mania
                </a>
              </span>
            </div>
          </div>

          <Map data={this.state.data} filters={this.state.filters} />
        </section>
      </Fragment>
    );
  }
}

export default App;
