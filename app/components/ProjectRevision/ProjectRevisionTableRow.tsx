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
      <td className="revision-type">{revisionType}</td>
      <td className="created-at">
        {getDisplayDateString(parseStringDate(createdAt))}
      </td>
      <td className="effective-date">
        {effectiveDate
          ? getDisplayDateString(parseStringDate(effectiveDate))
          : "Pending"}
      </td>
      <td className="updated-at">
        {getDisplayDateString(parseStringDate(updatedAt))}
      </td>
      <td className="updated-by">{cifUserByUpdatedBy?.fullName}</td>
      <td className="updated">
        {
          projectRevisionAmendmentTypesByProjectRevisionId.edges[0]?.node
            .amendmentType
        }
      </td>
      <td className="amendment-status">{amendmentStatus}</td>
      <td>
        <div className="actions">
          <Button size="small">View / edit placeholder</Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
      `}</style>
    </tr>
  );
};

export default ProjectRevisionTableRow;
