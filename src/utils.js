import { parse, format } from "date-fns";

const parseAvailabilityDate = (dateString) =>
  parse(dateString, "yyyy-MM-dd", new Date());

const reformatDate = (dateString) => {
  const date = parseAvailabilityDate(dateString);
  return format(date, "MMMM d (E)");
};

const formatFacilityName = (name) => {
  return (
    name
      // A few sites have ` RENTAL` at the end of their names,
      // which is redundant
      .replace(/ RENTAL$/, "")
      .replace("MTN.", "MOUNTAIN")
      .replace("MT.", "MOUNT")
      // There are a few remaining periods that don't make sense
      .replace(". ", " ")
  );
};

const isLikelyClosed = (availability) =>
  availability === null || Object.keys(availability).length === 0;

export {
  parseAvailabilityDate,
  reformatDate,
  formatFacilityName,
  isLikelyClosed,
};
