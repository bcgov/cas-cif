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

export const getWeeksUntilDue = (reportDueDate: DateTime) => {
  if (!reportDueDate) {
    return null;
  }
  return Math.floor(
    reportDueDate.diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
      "week"
    ).weeks
  );
};

export const getDisplayDueDateString = (
  daysUntilDue: number,
  weeksUntilDue: number,
  selectedDate: DateTime
) => {
  if (selectedDate === null) return null;
  const formattedValue = selectedDate.toFormat("MMM dd, yyyy");
  return daysUntilDue < 0
    ? `${formattedValue}`
    : daysUntilDue > 60
    ? `Due in ${weeksUntilDue} weeks (${formattedValue})`
    : `Due in ${daysUntilDue} ${
        daysUntilDue === 1 ? "day" : "days"
      } (${formattedValue})`;
};

export const getDisplayBeginDateString = (
  daysUntilDue: number,
  weeksUntilDue: number,
  selectedDate: DateTime
) => {
  if (selectedDate === null) return null;
  const formattedValue = selectedDate.toFormat("MMM dd, yyyy");
  return daysUntilDue < 0
    ? `${formattedValue}`
    : daysUntilDue > 60
    ? `Begins in ${weeksUntilDue} weeks (${formattedValue})`
    : `Begins in ${daysUntilDue} ${
        daysUntilDue === 1 ? "day" : "days"
      } (${formattedValue})`;
};

export const getDisplayDateString = (selectedDate: DateTime) => {
  if (!selectedDate) return null;
  return selectedDate.toFormat("MMM dd, yyyy");
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
