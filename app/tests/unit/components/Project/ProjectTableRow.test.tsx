import { screen } from "@testing-library/react";
import ProjectTableRow from "components/Project/ProjectTableRow";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectTableRowQuery, {
  ProjectTableRowQuery,
} from "__generated__/ProjectTableRowQuery.graphql";
import { ProjectTableRow_project } from "__generated__/ProjectTableRow_project.graphql";

const testQuery = graphql`
  query ProjectTableRowQuery($project: ID!) @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      project(id: $project) {
        ...ProjectTableRow_project
      }
    }
  }
`;

const mockQueryPayload = {
  Project() {
    const result: ProjectTableRow_project = {
      " $fragmentType": "ProjectTableRow_project",
      id: "mock-project-id",
      projectName: "Project 1",
      proposalReference: "12345",
      totalFundingRequest: "1.00",

      operatorByOperatorId: {
        legalName: "Operator 1 legal name",
      },
      projectStatusByProjectStatusId: {
        name: "Technical Review",
      },
      projectManagersByProjectId: {
        edges: [
          {
            node: {
              cifUserByCifUserId: {
                fullName: "Manager full name 1",
                id: "1",
              },
            },
          },
          {
            node: {
              cifUserByCifUserId: {
                fullName: "Manager full name 2",
                id: "2",
              },
            },
          },
        ],
      },
    };
    return result;
  },
};

// We're using a wrapper component to avoid rendering errors with <td> elements
// not being in a table.
const TestWrapper: React.FC = (props: any) => {
  return (
    <table>
      <tbody>
        <ProjectTableRow {...props} />
      </tbody>
    </table>
  );
};

const componentTestingHelper = new ComponentTestingHelper<ProjectTableRowQuery>(
  {
    component: TestWrapper,
    compiledQuery: compiledProjectTableRowQuery,
    testQuery: testQuery,
    defaultQueryResolver: mockQueryPayload,
    getPropsFromTestQuery: (data) => ({ project: data.query.project }),
  }
);

describe("The ProjectTableRow", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders a row with the appropriate data for CIF internal users in each cell", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent(
      (data) => ({ project: data.query.project }),
      { isInternal: true }
    );

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager full name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager full name 2/i)).toBeInTheDocument();
  });

  it("Renders a row with the appropriate data for external users in each cell", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.queryByText(/1.00/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Operator 1 legal name/i)
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.queryByText(/Manager full name 1/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Manager full name 2/i)).not.toBeInTheDocument();
  });
});
