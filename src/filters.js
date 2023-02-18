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

  const siteAccess = item.attributes?.details?.["Site Access"];
  return ["Drive-In", "Drive In"].includes(siteAccess);
};

const checkFilters = (item, filters) =>
  checkDateFilters(
    item,
    filters.consecutiveDays,
    filters.afterDate,
    filters.beforeDate
  ) &&
  checkCellCarrierFilter(item, filters.cellCarrier) &&
  checkCarAccessFilter(item, filters.carAccess);

export { checkFilters };
