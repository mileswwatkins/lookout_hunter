import {parse, format} from 'date-fns'
import React, { Component, Fragment } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import data from './availability.json';
import './App.css';

const reformatDate = date => {
  const datetime = parse(date, 'yyyy-MM-dd', new Date())
  return format(datetime, 'MMMM d (E)')
}

const formatFacilityName = name => {
  // A few sites have ` RENTAL` at the end of their names,
  // which is redundant
  return name.replace(/ RENTAL$/, '')
}

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      viewport: {
        width: 1200,
        height: 400,
        latitude: 37.7577,
        longitude: -122.4376,
        zoom: 5
      },
      popup: {
        visible: false,
        info: null,
        location: {
          latitude: null,
          longitude: null
        }
      },
      filter: {...this.initialFilterState}
    }
  }

  initialFilterState = {
    maxRate: '',
    consecutiveDays: ''
  }

  onReset = e => {
    e.preventDefault()
    this.setState({filter: {...this.initialFilterState}})
  }

  render () {
    return (
      <Fragment>
        <form onSubmit={e => e.preventDefault()}>
          <label>Max nightly cost ($):{'\u00A0'}
            <input
              type="number"
              min={Math.min(...data.map(i => i.rate).filter(i => i !== null))}
              max={Math.max(...data.map(i => i.rate))}
              step={1}
              value={this.state.filter.maxRate}
              onChange={e => this.setState({filter: {...this.state.filter, maxRate: e.target.value}})}
            ></input>
          </label>

          <label>Consecutive available days:{'\u00A0'}
            <input
              type="number"
              min={1}
              max={Math.max(...data.filter(i => i.metadata.facility_rules.maxConsecutiveStay).map(i => i.metadata.facility_rules.maxConsecutiveStay.value))}
              step={1}
              value={this.state.filter.consecutiveDays}
              onChange={e => this.setState({filter: { ...this.state.filter, consecutiveDays: e.target.value}})}
             ></input>
          </label>

          <input
            type="reset"
            value="Remove search filters"
            onClick={this.onReset}
          ></input>
        </form>

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
                  className={'Map-circle ' + (
                    i.availability !== null &&
                    Object.values(i.availability).some(v => v) &&
                    (
                      !this.state.filter.maxRate || (
                        !isNaN(this.state.filter.maxRate) &&
                        !isNaN(i.rate) &&
                        i.rate <= this.state.filter.maxRate
                      )
                    ) &&
                    (
                      !this.state.filter.consecutiveDays || (
                        Number.isInteger(this.state.filter.consecutiveDays) &&
                        i.availability !== null &&
                        Object.values(i.availability).reduce((accumulator, _, index, array) => {
                          return accumulator || (
                            index - (this.state.filter.consecutiveDays - 1) >= 0 &&
                            array.slice(index - (this.state.filter.consecutiveDays - 1), index + 1).every(v => v)
                          )
                        }, false)
                      )
                    )
                      ? 'Map-circle__active'
                      : 'Map-circle__inactive'
                  )}
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
              offsetTop={-10}
              anchor='bottom'
              dynamicPosition={false}
              captureScroll={true}
            >
              <div className='Map-Popup'>
                <span className='Map-Popup-header'>
                  {formatFacilityName(this.state.popup.info.metadata.facility_name)}
                </span>
                <div className='Map-Popup-body'>
                  {
                    (this.state.popup.info.availability === null || Object.keys(this.state.popup.info.availability).length === 0)
                      ? <span>Facility is closed</span>
                      : Object.values(this.state.popup.info.availability).every(v => !v)
                        ? <span>No availability found</span>
                        : <Fragment>
                            <span>Available:</span>
                            <ul className='Map-Popup-list'>
                              {
                                Object.entries(this.state.popup.info.availability)
                                  .filter(([date, isAvailable]) => isAvailable)
                                  .map(([date, isAvailable]) => <li key={date}>{reformatDate(date)}</li>)
                              }
                            </ul>
                          </Fragment>
                  }
                </div>
              </div>
            </Popup>
          }
        </ReactMapGL>
      </Fragment>
    );
  } 
}

export default App;
