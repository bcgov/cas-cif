import { DateTime } from "luxon";

const getDurationFromDates = (startDate: string, endDate: string) => {
  if (!startDate || !endDate) {
    return;
  }
  const { values } = DateTime.fromISO(endDate).diff(
    DateTime.fromISO(startDate),
    ["years", "months", "days", "hours"]
  );
  const numberOfMonths = 12 * values.years + values.months;
  let durationString = "";
  if (numberOfMonths > 0) {
    durationString += `${numberOfMonths} month${numberOfMonths > 1 ? "s" : ""}`;
  }
  if (values.days > 0) {
    if (durationString.length > 0) durationString += ", ";
    durationString += `${values.days} day${values.days > 1 ? "s" : ""}`;
  }

  return durationString;
};

export default getDurationFromDates;
