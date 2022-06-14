import { DateTime } from "luxon";

const getTimestamptzFromDate = (
  date: Date | DateTime,
  setTimeEndOfDay?: boolean
) => {
  if (date === null) {
    return null;
  }
  let tzDate =
    date instanceof DateTime
      ? date.setZone("America/Vancouver").set({
          day: date.get("day"),
          month: date.get("month"),
          year: date.get("year"),
        })
      : DateTime.fromJSDate(date)
          .setZone("America/Vancouver")
          .set({
            day: date.getDate(),
            month: date.getMonth() + 1,
            year: date.getFullYear(),
          });

  if (setTimeEndOfDay) {
    tzDate = tzDate.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  }
  return tzDate.toISO();
};

export default getTimestamptzFromDate;
