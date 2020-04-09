import {parse, format, isValid} from 'date-fns'
import React, { Component, Fragment } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import DatePicker from "react-datepicker";
import data from './availability.json';
import "react-datepicker/dist/react-datepicker.css";
import './App.css';

const parseAvailabilityDate = dateString => parse(dateString, 'yyyy-MM-dd', new Date())

const reformatDate = dateString => {
  const date = parseAvailabilityDate(dateString)
  return format(date, 'MMMM d (E)')
}

const formatFacilityName = name => {
  return name
    // A few sites have ` RENTAL` at the end of their names,
    // which is redundant
    .replace(/ RENTAL$/, '')
    .replace('MTN.', 'MOUNTAIN')
    .replace('MT.', 'MOUNT')
    // There are a few remaining periods that don't make sense
    .replace('. ', ' ')
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
      popup: {...this.initialPopupState},
      filters: {...this.initialFiltersState}
    }
  }

  initialPopupState = {
    visible: false,
    info: null,
    location: {
      latitude: null,
      longitude: null
    }
  }

  initialFiltersState = {
    maxRate: '',
    consecutiveDays: '',
    afterDate: null,
    beforeDate: null
  }

  onReset = e => {
    e.preventDefault()
    this.setState({filters: {...this.initialFiltersState}})
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
              value={this.state.filters.maxRate}
              onChange={e => this.setState({filters: {...this.state.filters, maxRate: e.target.value}})}
            ></input>
          </label>

          <label>Consecutive available days:{'\u00A0'}
            <input
              type="number"
              min={1}
              max={Math.max(...data.filter(i => i.metadata.facility_rules.maxConsecutiveStay).map(i => i.metadata.facility_rules.maxConsecutiveStay.value))}
              step={1}
              value={this.state.filters.consecutiveDays}
              onChange={e => this.setState({filters: { ...this.state.filters, consecutiveDays: e.target.value}})}
             ></input>
          </label>

          <label>After date:{'\u00A0'}
            <DatePicker
              selected={this.state.filters.afterDate}
              onChange={afterDate => this.setState({filters: {...this.state.filters, afterDate}})}
              minDate={new Date()}
              maxDate={this.state.filters.beforeDate}
              dateFormat='MMMM d yyyy'
            />
          </label>

          <label>Before date:{'\u00A0'}
            <DatePicker
              selected={this.state.filters.beforeDate}
              onChange={beforeDate => this.setState({ filters: { ...this.state.filters, beforeDate } })}
              minDate={this.state.filters.afterDate || new Date()}
              maxDate={
                parseAvailabilityDate(
                  data
                    .filter(i => i.availability !== null)
                    .map(i => Object.entries(i.availability))
                    .reduce((accumulator, i) => accumulator.concat(i), [])
                    .filter(([dateString, available]) => available)
                    .reduce(
                      (accumulator, [dateString]) => {
                        if (!accumulator) {
                          return dateString
                        } else {
                          return accumulator.localeCompare(dateString) < 0
                            ? dateString
                            : accumulator
                        }
                      },
                      null
                    )
                )
              }
              dateFormat='MMMM d yyyy'
            />
          </label>

          <input
            type="reset"
            value="Remove filters"
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
                  className={'Map-circle ' +
                    (
                      i.metadata.facility_latitude === this.state.popup.location.latitude &&
                      i.metadata.facility_longitude === this.state.popup.location.longitude
                        ? 'Map-circle__selected '
                        : ''
                    ) +
                    (
                      i.availability !== null &&
                      Object.values(i.availability).some(v => v) &&
                      (
                        !this.state.filters.maxRate || (
                          !isNaN(this.state.filters.maxRate) &&
                          !isNaN(i.rate) &&
                          i.rate <= this.state.filters.maxRate
                        )
                      ) &&
                      (
                        !this.state.filters.consecutiveDays || (
                          !isNaN(this.state.filters.consecutiveDays) &&
                          i.availability !== null &&
                          Object.values(i.availability).reduce((accumulator, _, index, array) => {
                            return accumulator || (
                              index - (this.state.filters.consecutiveDays - 1) >= 0 &&
                              array.slice(index - (this.state.filters.consecutiveDays - 1), index + 1).every(v => v)
                            )
                          }, false)
                        )
                      ) &&
                      (
                        !this.state.filters.afterDate || (
                          isValid(this.state.filters.afterDate) &&
                          Object.entries(i.availability)
                            .filter(([date, availability]) => availability)
                            .some(([date]) => parseAvailabilityDate(date) >= this.state.filters.afterDate)
                        )
                      ) &&
                      (
                        !this.state.filters.beforeDate || (
                          isValid(this.state.filters.beforeDate) &&
                          Object.entries(i.availability)
                            .filter(([date, availability]) => availability)
                            .some(([date]) => parseAvailabilityDate(date) <= this.state.filters.beforeDate)
                        )
                      )
                        ? 'Map-circle__active '
                        : 'Map-circle__inactive '
                    )
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
              closeOnClick={false}
              closeButton={true}
              onClose={() => this.setState({popup: {...this.initialPopupState}})}
              tipSize={0}
              offsetTop={-10}
              anchor='bottom'
              dynamicPosition={false}
              captureScroll={true}
            >
              <div className='Map-Popup'>
                <span className='Map-Popup-header'>
                  <a
                    href={`https://www.recreation.gov/camping/campgrounds/${this.state.popup.info.metadata.facility_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {formatFacilityName(this.state.popup.info.metadata.facility_name)}
                  </a>
                </span>
                <div className='Map-Popup-body'>
                  {
                    (this.state.popup.info.availability === null || Object.keys(this.state.popup.info.availability).length === 0)
                      ? <span className='Map-Popup-body__unavailable'>Facility is closed</span>
                      : Object.values(this.state.popup.info.availability).every(v => !v)
                        ? <span className='Map-Popup-body__unavailable'>No availability found</span>
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
