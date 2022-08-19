import { DateTime } from "luxon";

/**
 *
 * @param startDate The start date of the duration in timestamptz format (string).
 * @param endDate The end date of the duration in timestamptz format (string).
 * @returns a string containing the duration as number of months and days, e.g. "13 months, 1 day".
 */
const getDurationFromDates = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) {
    return null;
  }
  const { years, months, days } = DateTime.fromISO(endDate).diff(
    DateTime.fromISO(startDate),
    ["years", "months", "days", "hours"]
  );

  let numberOfMonths = months ?? 0;
  numberOfMonths += (years ?? 0) * 12;

  let durationString = "";
  if (numberOfMonths > 0) {
    durationString += `${numberOfMonths} month${numberOfMonths > 1 ? "s" : ""}`;
  }
  if (days && days > 0) {
    if (durationString.length > 0) durationString += ", ";
    durationString += `${days} day${days > 1 ? "s" : ""}`;
  }

  return durationString;
};

export default getDurationFromDates;
