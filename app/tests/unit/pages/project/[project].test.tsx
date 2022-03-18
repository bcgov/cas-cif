import { ProjectViewPage } from "pages/cif/project/[project]/index";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import compiledProjectViewQuery, {
  ProjectOverviewQuery,
} from "__generated__/ProjectOverviewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";

let environment;

const loadProjectData = (partialProject = {}) => {
  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, {
      Project() {
        return {
          id: "mock-project-id",
          projectName: "Project 1",
          proposalReference: "12345",
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
          contactsByProjectContactProjectIdAndContactId: {
            edges: [
              {
                node: {
                  id: "1",
                  fullName: "Contact full name 1",
                },
              },
              {
                node: {
                  id: "2",
                  fullName: "Contact full name 2",
                },
              },
              {
                node: {
                  id: "3",
                  fullName: "Contact full name 3",
                },
              },
            ],
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
          ...partialProject,
        };
      },
    });
  });

  const variables = {
    project: "mock-project-id",
  };
  environment.mock.queuePendingOperation(compiledProjectViewQuery, variables);
  return loadQuery<ProjectOverviewQuery>(
    environment,
    compiledProjectViewQuery,
    variables
  );
};

describe("ProjectViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("displays the project details", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <ProjectViewPage CSN preloadedQuery={loadProjectData()} />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/12345/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Summary 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 trade name/i)).toBeInTheDocument();
    expect(screen.getByText(/2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Emissions Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager first name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager last name 2/i)).toBeInTheDocument();
  });
});
