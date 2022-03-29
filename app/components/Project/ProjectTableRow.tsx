import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import { getProjectViewPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ProjectTableRow_project$key } from "__generated__/ProjectTableRow_project.graphql";
import Money from "lib/helpers/Money";

interface Props {
  project: ProjectTableRow_project$key;
}

const ProjectTableRow: React.FC<Props> = ({ project }) => {
  const {
    id,
    projectName,
    proposalReference,
    projectStatusByProjectStatusId: { name },
    totalFundingRequest,
    operatorByOperatorId: { tradeName },
    projectManagersByProjectId,
  } = useFragment(
    graphql`
      fragment ProjectTableRow_project on Project {
        id
        projectName
        proposalReference
        totalFundingRequest
        operatorByOperatorId {
          tradeName
        }
        projectStatusByProjectStatusId {
          name
        }
        projectManagersByProjectId(orderBy: PROJECT_MANAGER_LABEL_ID_ASC) {
          edges {
            node {
              cifUserByCifUserId {
                id
                givenName
                familyName
              }
            }
          }
        }
      }
    `,
    project
  );

  const router = useRouter();

  const handleViewClick = () => {
    router.push(getProjectViewPageRoute(id));
  };

  return (
    <tr>
      <td className="project-name">{projectName}</td>
      <td className="op-trade-name">{tradeName}</td>
      <td className="proposal-reference">{proposalReference}</td>
      <td className="status-container">
        <span className="status-badge">{name}</span>
      </td>
      <td>
        {projectManagersByProjectId.edges.map((manager, index) => {
          return (
            <span key={manager.node.cifUserByCifUserId.id}>
              {index ? "," : ""} {manager.node.cifUserByCifUserId.familyName}{" "}
              {manager.node.cifUserByCifUserId.givenName}
            </span>
          );
        })}
      </td>
      <td>
        <Money amount={totalFundingRequest} />
      </td>
      <td>
        <div className="actions">
          <Button size="small" onClick={handleViewClick}>
            View
          </Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
        .project-name,
        .op-trade-name {
          max-width: 15rem;
        }
        .proposal-reference {
          font-family: monospace;
          font-weight: bold;
          white-space: nowrap;
        }

        .status-container {
          text-align: center;
        }

        .status-badge {
          background-color: #555;
          color: #fff;
          padding: 0.2rem 0.6rem 0.3rem;
          border-radius: 0.25rem;
          border: 1px solid #d9d9d9;
          display: inline-block;
          white-space: nowrap;
        }

        .actions {
          display: flex;
          justify-content: space-around;
        }
      `}</style>
    </tr>
  );
};

export default ProjectTableRow;
