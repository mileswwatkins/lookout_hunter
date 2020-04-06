import {parse, format} from 'date-fns'
import React, { Component, Fragment } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import data from './availability.json';
import './App.css';

const formatDate = date => {
  const datetime = parse(date, 'yyyy-MM-dd', new Date())
  return format(datetime, 'MMMM d (E)')
}

class App extends Component {
  state = {
    viewport: {
      width: 1000,
      height: 600,
      latitude: 37.7577,
      longitude: -122.4376,
      zoom: 6
    },
    popup: {
      visible: false,
      info: null,
      location: {
        latitude: null,
        longitude: null
      }
    }
  }

  render () {
    return (
      <ReactMapGL
        {...this.state.viewport}
        onViewportChange={(viewport) => this.setState({ viewport })}
        mapStyle='mapbox://styles/mapbox/outdoors-v11'
        mapboxApiAccessToken='pk.eyJ1IjoibWlsZXN3d2F0a2lucyIsImEiOiJjazgzeHRzZ2kxaDF3M2VwYXVpam1jdnphIn0.l2i1tiNOOQy2QsOPKrKNNg'
      >
        {
          data.map(i =>
            <Marker
              key={i.metadata.facility_name}
              latitude={i.metadata.facility_latitude}
              longitude={i.metadata.facility_longitude}
            >
              <div
                className={'Map-circle ' + (i.availability && Object.values(i.availability).some(v => v)
                  ? 'Map-circle__active'
                  : 'Map-circle__inactive')
                }
                onClick={e => {
                  this.setState({
                    popup: {
                      visible: true,
                      info: i,
                      location: {
                        latitude: i.metadata.facility_latitude,
                        longitude: i.metadata.facility_longitude
                      }
                    }
                  })
                }}
              >
              </div>
            </Marker>
          )
        }
        {
          this.state.popup.visible &&
          <Popup
            {...this.state.popup.location}
            closeButton={true}
            onClose={() => this.setState({ popup: { visible: false } })}
            tipSize={0}
            // The height of the map dot
            offsetTop={-10}
            anchor='bottom'
            dynamicPosition={false}
            captureScroll={true}
          >
            <div className='Map-Popup'>
              <span className='Map-Popup-header'>
                {this.state.popup.info.metadata.facility_name}
              </span>
              <div className='Map-Popup-body'>
                {
                  (this.state.popup.info.availability === null || Object.keys(this.state.popup.info.availability).length === 0)
                    ? <span>Facility is closed</span>
                    : Object.values(this.state.popup.info.availability).every(v => !v)
                      ? <span>No availability</span>
                      : <Fragment>
                          <span>Available:</span>
                          <ul className='Map-Popup-list'>
                            {
                              Object.entries(this.state.popup.info.availability)
                                .filter(([date, isAvailable]) => isAvailable)
                                .map(([date, isAvailable]) => <li key={date}>{formatDate(date)}</li>)
                            }
                          </ul>
                        </Fragment>
                }
              </div>
            </div>
          </Popup>
        }
      </ReactMapGL>
    );
  } 
}

export default App;
