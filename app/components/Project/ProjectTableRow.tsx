import Button from "@button-inc/bcgov-theme/Button";
import { useRouter } from "next/router";
import { getProjectViewPageRoute } from "pageRoutes";
import { useFragment, graphql } from "react-relay";
import { ProjectTableRow_project$key } from "__generated__/ProjectTableRow_project.graphql";

interface Props {
  project: ProjectTableRow_project$key;
}

const ProjectTableRow: React.FC<Props> = ({ project }) => {
  const {
    id,
    projectName,
    rfpNumber,
    projectStatusByProjectStatusId: { name },
    operatorByOperatorId: { tradeName },
  } = useFragment(
    graphql`
      fragment ProjectTableRow_project on Project {
        id
        projectName
        rfpNumber
        operatorByOperatorId {
          tradeName
        }
        projectStatusByProjectStatusId {
          name
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
      <td className="rfp-number">{rfpNumber}</td>
      <td className="status-container">
        <span className="status-badge">{name}</span>
      </td>
      <td>
        J. Doeloremipsum,
        <br />
        J. Doe
      </td>
      <td>$1,000,000</td>
      <td>2099-01-01 (M)</td>
      <td>
        <Button onClick={handleViewClick}>View</Button>
      </td>
      <style jsx>{`
        .project-name,
        .op-trade-name {
          max-width: 15rem;
        }
        .rfp-number {
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
      `}</style>
    </tr>
  );
};

export default ProjectTableRow;
