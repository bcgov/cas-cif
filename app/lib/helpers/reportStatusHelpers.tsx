import { DateTime } from "luxon";

export const daysUntilReportDue = (reportDueDate) => {
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

export const isOverdue = (reportDueDate) => {
  return reportDueDate ? daysUntilReportDue(reportDueDate) < 0 : false;
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
