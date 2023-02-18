import { isValid } from "date-fns";
import { parseAvailabilityDate } from "./utils";

const checkDateFilters = (item, consecutiveDays, afterDate, beforeDate) => {
  if (item.availability === null) {
    return false;
  }

  if (isNaN(consecutiveDays)) {
    return true;
  }

  const afterDateIsSet = isValid(afterDate);
  const beforeDateIsSet = isValid(beforeDate);

  let consecutiveDaysSeen = 0;
  for (const [day, isDayAvailable] of Object.entries(item.availability)) {
    const dayDate = parseAvailabilityDate(day);
    // TODO: This filter seems to apply itself one day off, but the bug has
    // been a little tricky to fix
    if (afterDateIsSet && dayDate < afterDate) {
      continue;
    }
    if (beforeDateIsSet && dayDate > beforeDate) {
      break;
    }

    if (isDayAvailable) {
      consecutiveDaysSeen += 1;
    } else {
      consecutiveDaysSeen = 0;
    }

    if (consecutiveDaysSeen >= consecutiveDays) {
      return true;
    }
  }
  return false;
};

const checkCellCarrierFilter = (item, cellCarrier) => {
  if (!cellCarrier) {
    return true;
  }

  if (item.cell_coverage === null) {
    return false;
  }

  const rating = item.cell_coverage.find(
    (i) => i.carrier === cellCarrier
  )?.average_rating;
  // 3 out of 4 is a rating of "good"
  return !isNaN(rating) && rating >= 3;
};

const checkCarAccessFilter = (item, carAccess) => {
  if (!carAccess) {
    return true;
  }

  const details = item.attributes?.details;
  if (!details || typeof details !== "object") {
    return false;
  }

  // Any of these properties should _roughly_ indicate car access
  return (
    details["Site Access"] === "Drive-In" ||
    details["Max Num of Vehicles"] > 0 ||
    details["Min Num of Vehicles"] > 0 ||
    details["Driveway Grade"] ||
    details["Driveway Surface"] ||
    details["Driveway Entry"] ||
    details["Max Vehicle Length"] > 0 ||
    details["Hike In Distance to Site"] === 0
  );
};

// TODO: Car access filter is currently not utilized
const checkFilters = (item, filters) =>
  checkDateFilters(
    item,
    filters.consecutiveDays,
    filters.afterDate,
    filters.beforeDate
  ) && checkCellCarrierFilter(item, filters.cellCarrier);

export { checkFilters };
