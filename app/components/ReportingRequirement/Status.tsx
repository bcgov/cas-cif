import { getBadgeForOverallReportStatus } from "lib/helpers/reportStatusHelpers";

interface Props {
  reportType: "Quarterly" | "Annual" | "Milestone" | "Project Summary";
  upcomingReportDueDate: string;
  reportSubmittedDates: string[];
}

const Status: React.FC<Props> = ({
  reportType,
  upcomingReportDueDate,
  reportSubmittedDates,
}) => {
  let reportString = "Reports ";
  if (reportType === "Project Summary") {
    reportString = "Report ";
  }

  return (
    <div>
      Status of {reportType} {reportString}
      {getBadgeForOverallReportStatus(
        upcomingReportDueDate,
        reportSubmittedDates
      )}
      <style jsx>{`
        div {
          margin-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default Status;
