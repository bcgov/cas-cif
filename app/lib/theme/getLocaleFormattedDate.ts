import { DateTime } from "luxon";

// Receives a date and returns a string with the date in a human readable format
export const getLocaleFormattedDate = (isoDate: string) => {
  const formattedValue = DateTime.fromISO(isoDate)
    .setLocale("en-CA")
    .setZone("America/Vancouver")
    .toLocaleString(DateTime.DATE_MED);

  return formattedValue;
};
