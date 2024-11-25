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

  closePopup = () => {
    this.setState({ popup: { ...this.initialPopupState } });
  };

  render() {
    return (
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

        {this.state.popup.visible && (
          <MapPopup {...this.state.popup} onClose={this.closePopup} />
        )}
      </ReactMapGL>
    );
  }
}

export default Map;
