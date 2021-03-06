import { getBadgeForOverallReportStatus } from "lib/helpers/reportStatusHelpers";

interface Props {
  reportType: "Quarterly" | "Annual" | "Milestone";
  upcomingReportDueDate: string;
  reportSubmittedDates: string[];
}

const Status: React.FC<Props> = ({
  reportType,
  upcomingReportDueDate,
  reportSubmittedDates,
}) => {
  return (
    <div>
      Status of {reportType} Reports{" "}
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
