import { DateTime } from "luxon";

const getTimestamptzFromDate = (
  date: Date | DateTime,
  setTimeEndOfDay?: boolean
) => {
  let tzDate =
    date instanceof DateTime
      ? date.setZone("America/Vancouver")
      : DateTime.fromJSDate(date).setZone("America/Vancouver");

  if (setTimeEndOfDay) {
    tzDate = tzDate.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }
  return tzDate.toISO();
};

export default getTimestamptzFromDate;
