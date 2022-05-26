import { DateTime } from "luxon";

export const calculateReportDeadlines = (formChange) => {
  const reportingRequirement = formChange?.reportingRequirement;
  const hasValidReportDueDate = reportingRequirement?.reportDueDate;

  // We return a negative value if report is overdue
  const reportDueIn =
    hasValidReportDueDate &&
    DateTime.fromISO(reportingRequirement.reportDueDate).diff(
      // Current date without time information
      DateTime.fromISO(DateTime.now().toISODate()),
      "days"
    );

  const overdue = reportDueIn?.days < 0;

  const badgeColour = overdue ? "rgba(217, 41, 47, 0.1)" : "#003366";
  const labelColour = overdue ? "#D9292F" : "#FFFFFF";

  return {
    reportDueIn,
    overdue,
    reportingRequirement,
    hasValidReportDueDate,
    badgeColour,
    labelColour,
  };
};
