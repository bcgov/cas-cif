import Button from "@button-inc/bcgov-theme/Button";
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
        updatedBy
      }
    `,
    projectRevision
  );

  const { revisionType, createdAt, amendmentStatus, updatedAt, updatedBy } =
    projectRevisionData;

  return (
    <tr>
      <td className="revision-type">{revisionType}</td>
      <td className="created-at">{createdAt}</td>
      <td className="effective-date">effective date placeholder</td>
      <td className="updated-at">{updatedAt}</td>
      <td className="updated-by">{updatedBy}</td>
      <td className="updated">updated placeholder</td>
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
