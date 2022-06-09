import { DateTime } from "luxon";

export const daysUntilReportDue = (reportDueDate: string) => {
  const diff = DateTime.fromISO(reportDueDate, {
    setZone: true,
    locale: "en-CA",
  }).diff(
    // Current date without time information
    DateTime.now().setZone("America/Vancouver").startOf("day"),
    "days"
  );

  return Math.ceil(diff.days);
};

export const isOverdue = (reportDueDate: string | undefined) => {
  return reportDueDate ? daysUntilReportDue(reportDueDate) < 0 : false;
};

export const getReportingStatus = (
  reportSubmittedDates: string[],
  isReportOverdue: boolean
) => {
  const reportsExist = reportSubmittedDates?.length !== 0;

  if (!reportsExist) {
    return "none";
  } else if (reportsExist && !reportSubmittedDates.includes(undefined)) {
    return "complete";
  } else if (isReportOverdue) {
    return "late";
  } else {
    return "onTrack";
  }
};
