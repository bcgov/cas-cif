import { DateTime } from "luxon";

// Receives a date and returns a string with the date in a human readable format
export const getLocaleFormattedDate = (date: string) => {
  const formattedValue = DateTime.fromISO(date)
    .setLocale("en-CA")
    .toLocaleString(DateTime.DATE_MED);

  return formattedValue;
};
