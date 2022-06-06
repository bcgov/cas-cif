import { DateTime } from "luxon";

export const calculateReportDeadlines = (formChange) => {
  const reportingRequirement = formChange?.reportingRequirement;
  const hasValidReportDueDate = reportingRequirement?.reportDueDate;

  // We return a negative value if report is overdue
  const reportDueIn =
    hasValidReportDueDate &&
    DateTime.fromISO(reportingRequirement.reportDueDate, {
      setZone: true,
      locale: "en-CA",
    }).diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
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
