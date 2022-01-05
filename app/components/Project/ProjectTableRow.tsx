import Button from "@button-inc/bcgov-theme/Button";
import { useFragment, graphql } from "react-relay";
import { ProjectTableRow_project$key } from "__generated__/ProjectTableRow_project.graphql";

interface Props {
  project: ProjectTableRow_project$key;
}

const ProjectTableRow: React.FC<Props> = ({ project }) => {
  const {
    projectName,
    rfpNumber,
    operatorByOperatorId: { tradeName },
  } = useFragment(
    graphql`
      fragment ProjectTableRow_project on Project {
        projectName
        rfpNumber
        operatorByOperatorId {
          tradeName
        }
      }
    `,
    project
  );

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
        <Button>View</Button>
      </td>
    </tr>
  );
};

export default ProjectTableRow;
