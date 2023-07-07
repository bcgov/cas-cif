import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import {
  getExternalProjectRevisionViewPageRoute,
  getProjectRevisionFormPageRoute,
} from "routes/pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ProjectTableRow_project$key } from "__generated__/ProjectTableRow_project.graphql";
import Money from "lib/helpers/Money";
import ProjectMilestoneDue from "./ProjectMilestoneDue";

interface Props {
  project: ProjectTableRow_project$key;
  isInternal: boolean;
}

const ProjectTableRow: React.FC<Props> = ({ project, isInternal }) => {
  const projectData = useFragment(
    graphql`
      fragment ProjectTableRow_project on Project {
        id
        projectName
        proposalReference
        totalFundingRequest
        operatorByOperatorId {
          legalName
        }
        projectStatusByProjectStatusId {
          name
        }
        projectManagersByProjectId(
          orderBy: PROJECT_MANAGER_LABEL_ID_ASC
          filter: {
            projectManagerLabelByProjectManagerLabelId: {
              label: { includesInsensitive: "primary" }
            }
          }
        ) {
          edges {
            node {
              cifUserByCifUserId {
                id
                fullName
              }
            }
          }
        }
        latestCommittedProjectRevision {
          id
        }
        ...ProjectMilestoneDue_project
      }
    `,
    project
  );

  const {
    projectName,
    proposalReference,
    projectStatusByProjectStatusId: { name },
    totalFundingRequest,
    operatorByOperatorId: { legalName },
    projectManagersByProjectId,
    latestCommittedProjectRevision,
  } = projectData;

  const router = useRouter();

  const handleViewClick = () => {
    router.push(
      getProjectRevisionFormPageRoute(latestCommittedProjectRevision.id, 0)
    );
  };

  return (
    <tr>
      {isInternal ? (
        <>
          <td className="project-name">{projectName}</td>
          <td className="op-legal-name">{legalName}</td>
          <td className="proposal-reference">{proposalReference}</td>
          <td className="status-container">
            <span className="status-badge">{name}</span>
          </td>
          <td className="milestone-due">
            <ProjectMilestoneDue project={projectData} />
          </td>
          <td>
            {projectManagersByProjectId.edges.map((manager, index) => {
              return (
                <span key={manager.node.cifUserByCifUserId.id}>
                  {index ? "," : ""} {manager.node.cifUserByCifUserId.fullName}
                </span>
              );
            })}
          </td>
          <td>
            <Money amount={totalFundingRequest} />
          </td>
        </>
      ) : (
        <>
          <td className="proposal-reference">{proposalReference}</td>
          <td className="project-name">{projectName}</td>
          <td className="status-container">
            <span className="status-badge">{name}</span>
          </td>
        </>
      )}
      <td>
        <div className="actions">
          <Button
            size="small"
            onClick={
              isInternal
                ? handleViewClick
                : () =>
                    router.push(
                      getExternalProjectRevisionViewPageRoute(
                        latestCommittedProjectRevision.id
                      )
                    )
            }
          >
            View
          </Button>
        </div>
      </td>
      <style jsx>{`
        td {
          vertical-align: top;
        }
        .project-name,
        .op-legal-name {
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
