import StatusBadge from "components/StatusBadge";
import {
  getDaysUntilDue,
  parseStringDate,
} from "lib/helpers/reportStatusHelpers";
import { DateTime } from "luxon";

interface Props {
  reportDueDateString?: string;
  submittedDateString?: string;
  emissionIntensityEndDateString?: string;
}

export const EmissionIntensityReportStatus: React.FC<Props> = ({
  reportDueDateString,
  submittedDateString,
  emissionIntensityEndDateString,
}) => {
  const getBadgeForEmissionIntensityReportStatus = () => {
    const parsedDueDate = parseStringDate(reportDueDateString);
    const parsedSubmittedDate = parseStringDate(submittedDateString);
    const parsedEmissionIntensityEndDate = parseStringDate(
      emissionIntensityEndDateString
    );

    // comparing today with TEIMP end date
    const isEmissionIntensityReportEnded =
      getDaysUntilDue(parsedEmissionIntensityEndDate) < 0;

    if (parsedSubmittedDate) {
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
    }
    if (
      parsedEmissionIntensityEndDate &&
      (!isEmissionIntensityReportEnded || !parsedDueDate)
    ) {
      return <StatusBadge variant="notDue" />;
    }
    if (isEmissionIntensityReportEnded && parsedDueDate) {
      const dueIn = Math.ceil(getDaysUntilDue(parsedDueDate));
      if (dueIn < 0) return <StatusBadge variant="late" />;
      if (dueIn > 60) {
        const numberOfWeeks = Math.floor(dueIn / 7);
        return (
          <StatusBadge
            variant="dueIn"
            label={`Due in ${numberOfWeeks} ${
              numberOfWeeks > 1 ? "weeks" : "week"
            }`}
          />
        );
      }
      return (
        <StatusBadge
          variant="dueIn"
          label={`Due in ${dueIn} ${dueIn > 1 ? "days" : "day"}`}
        />
      );
    }
    return <StatusBadge variant="none" />;
  };
  return (
    <>
      <h3>Status</h3>
      <div className="status">
        Status of Emissions Intensity Report
        {getBadgeForEmissionIntensityReportStatus()}
      </div>
      <style jsx>{`
        .status {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 1rem;
        }
      `}</style>
    </>
  );
};
