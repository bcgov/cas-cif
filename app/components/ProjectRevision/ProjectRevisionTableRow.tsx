import Button from "@button-inc/bcgov-theme/Button";
import {
  getDisplayDateString,
  parseStringDate,
} from "lib/helpers/reportStatusHelpers";
import { useFragment, graphql } from "react-relay";
import { ProjectRevisionTableRow_projectRevision$key } from "__generated__/ProjectRevisionTableRow_projectRevision.graphql";

interface Props {
  projectRevision: ProjectRevisionTableRow_projectRevision$key;
}

const ProjectRevisionTableRow: React.FC<Props> = ({ projectRevision }) => {
  const projectRevisionData = useFragment(
    graphql`
      fragment ProjectRevisionTableRow_projectRevision on ProjectRevision {
        revisionType
        createdAt
        amendmentStatus
        updatedAt
        effectiveDate
        cifUserByUpdatedBy {
          fullName
        }
        projectRevisionAmendmentTypesByProjectRevisionId {
          edges {
            node {
              amendmentType
            }
          }
        }
      }
    `,
    projectRevision
  );

  const {
    revisionType,
    createdAt,
    amendmentStatus,
    effectiveDate,
    updatedAt,
    cifUserByUpdatedBy,
    projectRevisionAmendmentTypesByProjectRevisionId,
  } = projectRevisionData;

  return (
    <tr>
      <td>{revisionType}</td>
      <td>{getDisplayDateString(parseStringDate(createdAt))}</td>
      <td>
        {effectiveDate
          ? getDisplayDateString(parseStringDate(effectiveDate))
          : "Pending"}
      </td>
      <td>{getDisplayDateString(parseStringDate(updatedAt))}</td>
      <td>{cifUserByUpdatedBy?.fullName}</td>
      <td>
        {projectRevisionAmendmentTypesByProjectRevisionId.edges
          .map(({ node }) => node.amendmentType)
          .join(", ")}
      </td>
      <td>{amendmentStatus}</td>
      <td>
        <div>
          <Button size="small">View {!effectiveDate && "/ Edit"}</Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
        td :global(button.pg-button) {
          width: 100%;
        }
      `}</style>
    </tr>
  );
};

export default ProjectRevisionTableRow;
