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
      <td>{projectName}</td>
      <td>{tradeName}</td>
      <td>{rfpNumber}</td>
      <td>Status Here</td>
      <td>
        J. Doe,
        <br />
        J. Doe
      </td>
      <td>42</td>
      <td>$1,000,000</td>
      <td>2099-01-01 (M)</td>
      <td>
        <Button onClick={handleViewClick}>View</Button>
      </td>
    </tr>
  );
};

export default ProjectTableRow;
