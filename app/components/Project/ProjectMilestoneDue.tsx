import Badge from "components/StatusBadge";
import { DateTime } from "luxon";
import { useFragment, graphql } from "react-relay";
import { ProjectMilestoneDue_project$key } from "__generated__/ProjectMilestoneDue_project.graphql";

interface Props {
  project: ProjectMilestoneDue_project$key;
}

const ProjectMilestoneDue: React.FC<Props> = ({ project }) => {
  const { nextMilestoneDueDate, latestCompletedReportingRequirements } =
    useFragment(
      graphql`
        fragment ProjectMilestoneDue_project on Project {
          nextMilestoneDueDate
          latestCompletedReportingRequirements: reportingRequirementsByProjectId(
            orderBy: REPORT_DUE_DATE_DESC
            filter: {
              submittedDate: { isNull: false }
              reportTypeByReportType: { isMilestone: { equalTo: true } }
            }
            first: 1
          ) {
            edges {
              node {
                reportDueDate
              }
            }
          }
        }
      `,
      project
    );
  const latestCompletedReportDueDate =
    latestCompletedReportingRequirements.edges[0]?.node?.reportDueDate;

  const milestoneComplete =
    latestCompletedReportDueDate == nextMilestoneDueDate;

  if (!nextMilestoneDueDate) {
    return (
      <>
        <Badge variant="none" />
      </>
    );
  }

  const parsedNextReportDueDate =
    nextMilestoneDueDate &&
    DateTime.fromISO(nextMilestoneDueDate, {
      setZone: true,
      locale: "en-CA",
    }).startOf("day");

  const reportDueIn =
    parsedNextReportDueDate &&
    parsedNextReportDueDate.diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
      "days"
    ).days;

  return (
    <>
      {parsedNextReportDueDate && (
        <div>{parsedNextReportDueDate.toFormat("MMM dd, yyyy")}</div>
      )}
      <Badge
        variant={
          !milestoneComplete
            ? reportDueIn < 0
              ? "late"
              : "onTrack"
            : "complete"
        }
      />
    </>
  );
};

export default ProjectMilestoneDue;
