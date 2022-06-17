import StatusBadge from "components/StatusBadge";
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

export const getBadgeForDates = (
  reportDueDateString: string,
  submittedDateString: string
) => {
  const parsedDueDate =
    reportDueDateString &&
    DateTime.fromISO(reportDueDateString, {
      setZone: true,
      locale: "en-CA",
    }).startOf("day");
  const parsedSubmittedDate =
    submittedDateString &&
    DateTime.fromISO(submittedDateString, {
      setZone: true,
      locale: "en-CA",
    }).startOf("day");

  if (parsedDueDate && parsedSubmittedDate) {
    {
      return (
        <StatusBadge
          variant="complete"
          label={`Complete (${parsedSubmittedDate.toLocaleString(
            DateTime.DATE_MED
          )})`}
        />
      );
    }
  } else if (parsedDueDate && !parsedSubmittedDate) {
    const dueIn = parsedDueDate.diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
      "days"
    ).days;

    return dueIn < 0 ? (
      <StatusBadge variant="late" />
    ) : (
      <StatusBadge variant="onTrack" />
    );
  } else {
    return null;
  }
};
