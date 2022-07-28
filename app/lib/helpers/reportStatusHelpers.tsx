import StatusBadge from "components/StatusBadge";
import { DateTime } from "luxon";

export const parseStringDate = (stringDate: string) => {
  if (!stringDate) return null;
  return (
    stringDate &&
    DateTime.fromISO(stringDate, {
      zone: "America/Vancouver",
      locale: "en-CA",
    }).startOf("day")
  );
};

export const getDaysUntilDue = (reportDueDate: DateTime) => {
  if (!reportDueDate) {
    return null;
  }
  return Math.floor(
    reportDueDate.diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
      "days"
    ).days
  );
};

export const getBadgeForOverallReportStatus = (
  upcomingReportDueDateString: string,
  reportSubmittedDates: string[]
) => {
  const parsedDueDate = parseStringDate(upcomingReportDueDateString);
  const reportsExist = reportSubmittedDates?.length !== 0;
  if (!reportsExist) {
    return <StatusBadge variant="none" />;
  } else if (reportsExist && !reportSubmittedDates.includes(undefined)) {
    return <StatusBadge variant="complete" />;
  } else {
    const dueIn = getDaysUntilDue(parsedDueDate);
    return dueIn < 0 ? (
      <StatusBadge variant="late" />
    ) : (
      <StatusBadge variant="onTrack" />
    );
  }
};

export const getBadgeForIndividualReportStatus = (
  reportDueDateString: string,
  submittedDateString: string
) => {
  const parsedDueDate = parseStringDate(reportDueDateString);
  const parsedSubmittedDate = parseStringDate(submittedDateString);

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
    const dueIn = getDaysUntilDue(parsedDueDate);

    return dueIn < 0 ? (
      <StatusBadge variant="late" />
    ) : (
      <StatusBadge variant="onTrack" />
    );
  } else {
    return null;
  }
};
