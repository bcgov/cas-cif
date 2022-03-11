import { render, screen } from "@testing-library/react";
import ProjectTableRow from "components/Project/ProjectTableRow";
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import compiledProjectTableRowQuery, {
  ProjectTableRowQuery,
} from "__generated__/ProjectTableRowQuery.graphql";

const loadedQuery = graphql`
  query ProjectTableRowQuery($project: ID!) @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      project(id: $project) {
        ...ProjectTableRow_project
      }
    }
  }
`;

let environment;
const TestRenderer = () => {
  const data = useLazyLoadQuery<ProjectTableRowQuery>(loadedQuery, {
    project: "test-project",
  });
  return <ProjectTableRow project={data.query.project} />;
};
const renderProjectForm = () => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer />
    </RelayEnvironmentProvider>
  );
};

const getMockQueryPayload = () => ({
  Query() {
    return {
      project: {
        id: "mock-project-id",
        projectName: "Project 1",
        rfpNumber: "12345",
        totalFundingRequest: "1.00",
        summary: "Summary 1",
        operatorByOperatorId: {
          legalName: "Operator 1 legal name",
          tradeName: "Operator 1 trade name",
        },
        fundingStreamRfpByFundingStreamRfpId: {
          year: 2022,
          fundingStreamByFundingStreamId: {
            description: "Emissions Performance",
          },
        },
        projectStatusByProjectStatusId: {
          name: "Technical Review",
        },
        projectManagersByProjectId: {
          edges: [
            {
              node: {
                cifUserByCifUserId: {
                  firstName: "Manager first name 1",
                  lastName: "Manager last name 1",
                  id: "1",
                },
              },
            },
            {
              node: {
                cifUserByCifUserId: {
                  firstName: "Manager first name 2",
                  lastName: "Manager last name 2",
                  id: "2",
                },
              },
            },
          ],
        },
      },
    };
  },
});

describe("The ProjectTableRow", () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, getMockQueryPayload())
    );

    environment.mock.queuePendingOperation(compiledProjectTableRowQuery, {});
  });

  it("Renders a row with the appropriate data in each cell", () => {
    renderProjectForm();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 trade name/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 2/i)).toBeInTheDocument();
  });
});
