import Badge from "components/StatusBadge";
import { DateTime } from "luxon";
import { useFragment, graphql } from "react-relay";
import { ProjectMilestoneDue_project$key } from "__generated__/ProjectMilestoneDue_project.graphql";

interface Props {
  project: ProjectMilestoneDue_project$key;
}

const ProjectMilestoneDue: React.FC<Props> = ({ project }) => {
  const {
    latestCommittedProjectRevision,
    latestCompletedReportingRequirements,
  } = useFragment(
    graphql`
      fragment ProjectMilestoneDue_project on Project {
        latestCommittedProjectRevision {
          upcomingReportingRequirementFormChange(reportType: "Milestone") {
            asReportingRequirement {
              reportDueDate
            }
          }
        }
        latestCompletedReportingRequirements: reportingRequirementsByProjectId(
          orderBy: REPORT_DUE_DATE_ASC
          filter: {
            submittedDate: { isNull: false }
            reportType: { includes: "Milestone" }
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

  const upcomingReportDueDate =
    latestCommittedProjectRevision.upcomingReportingRequirementFormChange
      ?.asReportingRequirement?.reportDueDate;
  const latestCompletedReportDueDate =
    latestCompletedReportingRequirements.edges[0]?.node?.reportDueDate;

  const nextReportDueDate =
    upcomingReportDueDate || latestCompletedReportDueDate;

  if (!nextReportDueDate) {
    return (
      <>
        <Badge variant="none" />
      </>
    );
  }

  const parsedNextReportDueDate =
    nextReportDueDate &&
    DateTime.fromISO(nextReportDueDate, {
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
          upcomingReportDueDate
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
