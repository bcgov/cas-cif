import { DateTime } from "luxon";

// This is not an exhaustive list of options, more can be found:
// https://moment.github.io/luxon/#/math
export interface TimeDuration {
  years: number;
  months: number;
  days: number;
}

/**
 *
 * @param timestampString The date we are adding the duration to, in timestamptz format (string).
 * @param toAdd The duration to be added to the date
 * @returns The resulting date in timestamptz format (string).
 */
const addDurationToTimestamptz = (
  timestampString: string,
  toAdd: Partial<TimeDuration>
) => {
  const date = DateTime.fromISO(timestampString);
  return date.plus(toAdd).toISO();
};

export default addDurationToTimestamptz;
