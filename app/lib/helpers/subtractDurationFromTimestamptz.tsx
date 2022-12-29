import { DateTime } from "luxon";
import { TimeDuration } from "./addDurationToTimestamptz";

/**
 *
 * @param timestampString The date we are subtracting the duration from, in timestamptz format (string).
 * @param toSubtract The duration to be subtracted from the date
 * @returns The resulting date in timestamptz format (string).
 */
const subtractDurationFromTimestamptz = (
  timestampString: string,
  toSubtract: Partial<TimeDuration>
) => {
  const date = DateTime.fromISO(timestampString);
  return date.minus(toSubtract).toISO();
};

export default subtractDurationFromTimestamptz;
