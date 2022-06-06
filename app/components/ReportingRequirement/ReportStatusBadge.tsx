import Chip from "@mui/material/Chip";
import { calculateReportDeadlines } from "lib/helpers/calculateReportDeadlines";
import { graphql, useFragment } from "react-relay";
import { ReportStatusBadge_formChange$key } from "__generated__/ReportStatusBadge_formChange.graphql";

interface Props {
  reportDueFormChange: ReportStatusBadge_formChange$key;
}

const ReportStatusBadge: React.FC<Props> = ({ reportDueFormChange }) => {
  const formChange = useFragment(
    graphql`
      fragment ReportStatusBadge_formChange on FormChange {
        reportingRequirement: asReportingRequirement {
          reportDueDate
        }
      }
    `,
    reportDueFormChange
  );

  const { overdue, badgeColour, labelColour } =
    calculateReportDeadlines(formChange);

  return <p>i am a placeholder for pierre's component</p>;
};

export default ReportStatusBadge;
