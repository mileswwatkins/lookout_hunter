import { parse, format } from "date-fns";
import { startCase } from "lodash";

const parseAvailabilityDate = (dateString) =>
  parse(dateString, "yyyy-MM-dd", new Date());

const reformatDate = (dateString) => {
  const date = parseAvailabilityDate(dateString);
  return format(date, "MMMM d (E)");
};

const formatFacilityName = (name) => {
  const cleanedName = name
    // A few sites have ` RENTAL` at the end of their names,
    // which is redundant
    .replace(/ RENTAL$/i, "")
    // Remove the parentheticals
    .replace(/ \(.+\)$/, "")
    .replace(/MTN(?=[\. ])/, "MOUNTAIN")
    .replace(/MT\./, "MOUNT")
    // There are a few remaining periods that don't make sense
    .replace(". ", " ");

  let casedName =
    cleanedName === cleanedName.toUpperCase()
      ? startCase(cleanedName.toLowerCase())
      : cleanedName;
  if (casedName.startsWith("Mc")) {
    casedName = "Mc" + casedName[2].toUpperCase() + casedName.slice(3);
  }

  return casedName;
};

const isLikelyClosed = (availability) =>
  availability === null || Object.keys(availability).length === 0;

export {
  parseAvailabilityDate,
  reformatDate,
  formatFacilityName,
  isLikelyClosed,
};
