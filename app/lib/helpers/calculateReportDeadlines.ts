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

  return {
    reportDueIn,
    overdue,
    reportingRequirement,
    hasValidReportDueDate,
  };
};

export const reportDueIn = (reportDueDate) => {
  const diff = DateTime.fromISO(reportDueDate, {
    setZone: true,
    locale: "en-CA",
  }).diff(
    // Current date without time information
    DateTime.now().setZone("America/Vancouver").startOf("day"),
    "days"
  );
  return diff.days;
};

export const isOverdue = (reportDueDate) => {
  return reportDueDate ? reportDueIn(reportDueDate) < 0 : false;
};

export const determineVariant = (reportFormChanges, isReportOverdue) => {
  const areAllReportsComplete = !reportFormChanges.edges.some(
    ({ node }) => node && !node.newFormData.submittedDate
  );

  let variant;
  if (areAllReportsComplete && reportFormChanges.edges.length !== 0) {
    variant = "complete";
  } else if (reportFormChanges.edges.length === 0) {
    variant = "none";
  } else if (isReportOverdue) {
    variant = "late";
  } else {
    variant = "onTrack";
  }
  return variant;
};
