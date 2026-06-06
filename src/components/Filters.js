import { range } from "lodash";
import "./Filters.css";

const Filters = ({
  afterDateMin,
  afterDateMax,
  afterDate,
  onChangeAfterDate,
  beforeDateMin,
  beforeDateMax,
  beforeDate,
  onChangeBeforeDate,
  consecutiveNights,
  consecutiveNightsMax,
  onChangeConsecutiveNights,
  allCellCarriers,
  cellCarrier,
  onChangeCellCarrier,
  carAccess,
  onChangeCarAccess,
  electricity,
  onChangeElectricity,
  accessible,
  onChangeAccessible,
  onSubmit,
  onReset,
}) => {
  return (
    <section>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="Filter-Text">
          I'd like to{" "}
          <a
            href="https://github.com/mileswwatkins/lookout_hunter#lookout-hunter"
            rel="noreferrer"
            target="_blank"
          >
            camp in a fire lookout tower
          </a>{" "}
          anytime between{" "}
          <input
            type="date"
            value={afterDate.toISOString().split("T")[0]}
            onChange={(e) => {
              // This is a timezone-aware date (that presents as the local timezone)
              onChangeAfterDate(e.target.valueAsDate);
            }}
            min={afterDateMin.toISOString().split("T")[0]}
            max={afterDateMax.toISOString().split("T")[0]}
            className="Filter-DateText"
          />{" "}
          and{" "}
          <input
            type="date"
            value={beforeDate.toISOString().split("T")[0]}
            onChange={(e) => {
              onChangeBeforeDate(e.target.valueAsDate);
            }}
            min={beforeDateMin.toISOString().split("T")[0]}
            max={beforeDateMax.toISOString().split("T")[0]}
            className="Filter-DateText"
          />
          , for at least{" "}
          <select
            onChange={onChangeConsecutiveNights}
            value={consecutiveNights}
            className="Filter-SelectText"
          >
            {range(1, consecutiveNightsMax + 1).map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>{" "}
          {consecutiveNights > 1 && "consecutive "}night
          {consecutiveNights > 1 && "s"}.
        </div>
        <div className="Filter-Text">
          Additionally, I'd like the lookout to:
          <ul className="Filter-List">
            <li className="Filter-ListItem">
              {/* This is unexpected UX, but it's more visually pleasing if all `li`s have checkboxes */}
              <input
                type="checkbox"
                className="Filter-Checkbox"
                checked={Boolean(cellCarrier)}
                onChange={(e) => {
                  if (cellCarrier) {
                    onChangeCellCarrier({ target: { value: "" } });
                  }
                }}
              ></input>{" "}
              {/*
                For some reason, a normal space (` `) isn't rendering here, so
                use a non-standard space character instead
              */}
              Have{" "}
              <select
                value={cellCarrier}
                onChange={onChangeCellCarrier}
                className="Filter-SelectText"
              >
                <option value=""></option>
                {allCellCarriers.map((i) => (
                  <option value={i} key={i}>
                    {i}
                  </option>
                ))}
              </select>
              {" "}
              reception
            </li>
            <li className="Filter-ListItem">
              <input
                type="checkbox"
                id="checkbox-electricity"
                className="Filter-Checkbox"
                checked={electricity}
                onChange={onChangeElectricity}
              ></input>
              <label htmlFor="checkbox-electricity">Have electricity</label>
            </li>
            <li className="Filter-ListItem">
              <input
                type="checkbox"
                id="checkbox-carAccess"
                className="Filter-Checkbox"
                checked={carAccess}
                onChange={onChangeCarAccess}
              ></input>
              <label htmlFor="checkbox-carAccess">Be accessible by car</label>
            </li>
            <li className="Filter-ListItem">
              <input
                type="checkbox"
                id="checkbox-accessible"
                className="Filter-Checkbox"
                checked={accessible}
                onChange={onChangeAccessible}
              ></input>
              <label htmlFor="checkbox-accessible">Be ADA accessible</label>
            </li>
          </ul>
        </div>
        <div className="Filter-Buttons">
          <input
            type="submit"
            className="Filter-Submit"
            value="Search for lookouts"
            onClick={onSubmit}
          ></input>
          <input
            type="reset"
            className="Filter-Reset"
            value="Reset filters"
            onClick={onReset}
          ></input>
        </div>
      </form>
    </section>
  );
};

export default Filters;
