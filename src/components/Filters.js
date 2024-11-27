import { add, sub } from "date-fns";
import { range } from "lodash";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Filters.css";

const Filters = ({
  afterDate,
  onChangeAfterDate,
  beforeDate,
  onChangeBeforeDate,
  consecutiveNightsMax,
  consecutiveNights,
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
  onReset,
}) => {
  const beforeDateMin = add(afterDate || new Date(), { days: 1 });
  // Availability windows are typically only 6 months into
  // the future
  const beforeDateMax = add(new Date(), { months: 6, days: 1 });

  const afterDateMin = new Date();
  const afterDateMax = sub(beforeDate || beforeDateMax, { days: 1 });

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
          <DatePicker
            selected={afterDate}
            onChange={onChangeAfterDate}
            minDate={afterDateMin}
            maxDate={afterDateMax}
            dateFormat="MMMM d"
            className="Filter-DateText"
          />{" "}
          and{" "}
          <DatePicker
            selected={beforeDate}
            onChange={onChangeBeforeDate}
            minDate={beforeDateMin}
            maxDate={beforeDateMax}
            dateFormat="MMMM d"
            className="Filter-DateText"
          />
          , for at least
          <select
            onChange={onChangeConsecutiveNights}
            value={consecutiveNights}
            className="Filter-SelectText"
          >
            {range(1, consecutiveNightsMax).map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
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
              Have
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
        <input
          type="reset"
          className="Filter-Reset"
          value="Reset filters"
          onClick={onReset}
        ></input>
      </form>
    </section>
  );
};

export default Filters;
