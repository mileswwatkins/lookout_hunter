import { Component } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import { checkFilters } from "../filters";
import MapPopup from "./MapPopup";
import "./Map.css";

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

  // Close popup only if the user _isn't_ trying to invoke a different popup
  onMapClick = (e) => {
    const isCircleClick =
      !e.originalEvent.target.classList.contains("mapboxgl-canvas");
    if (!isCircleClick && this.state.popup.visible) {
      this.setState({ popup: { ...this.initialPopupState } });
    }
  };

  render() {
    return (
      <div className={`Map ${!this.props.isActive && "Map--hidden"}`}>
        <div
          className={`Map-Logo-Backing ${this.props.isActive && "Map-Logo-Backing--active"}`}
          onClick={this.props.returnToFilters}
        >
          <img
            src="logo.svg"
            alt="the silhouette of a fire lookout tower"
            className="Map-Logo"
          ></img>
        </div>
        <ReactMapGL
          initialViewState={{
            latitude: 42,
            longitude: -115,
            zoom: 4.5,
          }}
          mapStyle="mapbox://styles/mapbox/outdoors-v12"
          mapboxAccessToken={
            process.env.REACT_APP_MAPBOX_TOKEN ??
            "pk.eyJ1IjoibWlsZXN3d2F0a2lucyIsImEiOiJjbG0xcXl5cngzNnFyM2twaXk4cG83NXFyIn0.420VQRr7GT87ST-4uJ_9nA"
          }
          onClick={this.onMapClick}
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
                    : "")
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

          {this.state.popup.visible && <MapPopup {...this.state.popup} />}
        </ReactMapGL>
      </div>
    );
  }
}

export default Map;
