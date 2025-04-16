import { add } from "date-fns";
import React, { Component } from "react";
import "./App.css";
import Filters from "./components/Filters";
import Logotype from "./components/Logotype";
import Map from "./components/Map";
import Attribution from "./components/Attribution";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      popup: { ...this.initialPopupState },
      filters: { ...this.initialFiltersState },
      data: [],
      hideFiltersOnMobile: false,
    };

    this.onChangeAfterDate = this.onChangeAfterDate.bind(this);
    this.onChangeBeforeDate = this.onChangeBeforeDate.bind(this);
    this.onChangeConsecutiveNights = this.onChangeConsecutiveNights.bind(this);
    this.onChangeCellCarrier = this.onChangeCellCarrier.bind(this);
    this.onChangeElectricity = this.onChangeElectricity.bind(this);
    this.onChangeCarAccess = this.onChangeCarAccess.bind(this);
    this.onChangeAccessible = this.onChangeAccessible.bind(this);
    this.onReset = this.onReset.bind(this);
  }

  initialFiltersState = {
    consecutiveNights: 1,
    afterDate: new Date(),
    beforeDate: add(new Date(), { months: 6, days: 1 }),
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

  onChangeConsecutiveNights = (e) => {
    this.setState({
      filters: {
        ...this.state.filters,
        consecutiveNights: Number(e.target.value),
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

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({
      hideFiltersOnMobile: true,
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

  returnToFilters = () => {
    this.setState({
      hideFiltersOnMobile: false,
    });
  };

  render() {
    if (!this.state.data.length) {
      return "";
    }

    const consecutiveNightsMax = Math.max(
      ...this.state.data
        .filter((i) => i.metadata.facility_rules?.maxConsecutiveStay)
        .map((i) => i.metadata.facility_rules.maxConsecutiveStay.value),
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
      <div className="Main">
        <div
          className={`FilterPane ${this.state.hideFiltersOnMobile && "FilterPane--hidden"}`}
        >
          <div>
            <Logotype />
            <Filters
              {...this.state.filters}
              consecutiveNightsMax={consecutiveNightsMax}
              allCellCarriers={allCellCarriers}
              onChangeAfterDate={this.onChangeAfterDate}
              onChangeBeforeDate={this.onChangeBeforeDate}
              onChangeConsecutiveNights={this.onChangeConsecutiveNights}
              onChangeCellCarrier={this.onChangeCellCarrier}
              onChangeElectricity={this.onChangeElectricity}
              onChangeCarAccess={this.onChangeCarAccess}
              onChangeAccessible={this.onChangeAccessible}
              onSubmit={this.onSubmit}
              onReset={this.onReset}
            />
          </div>

          <Attribution />
        </div>

        <Map
          data={this.state.data}
          filters={this.state.filters}
          returnToFilters={this.returnToFilters}
          isActive={this.state.hideFiltersOnMobile}
        />
      </div>
    );
  }
}

export default App;
