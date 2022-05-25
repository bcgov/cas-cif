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

  return (
    <>
      <h3>Status</h3>
      <div>
        Status of Quarterly Reporting{" "}
        <Chip
          label={overdue ? "Late" : "On track"}
          sx={{
            backgroundColor: badgeColour,
            ".MuiChip-label": {
              color: labelColour,
              marginLeft: "6px",
              marginRight: "6px",
              marginTop: "12px",
              marginBottom: "12px",
              fontWeight: "bold",
            },
          }}
        />
      </div>
      <style jsx>
        {`
          .MuiChip-label {
            color: pink;
          }
        `}
      </style>
    </>
  );
};

export default ReportStatusBadge;
