import { ProjectViewPage } from "pages/cif/project/[project]/index";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { render, screen, act } from "@testing-library/react";
import compiledProjectViewQuery, {
  ProjectOverviewQuery,
  ProjectOverviewQuery$variables,
} from "__generated__/ProjectOverviewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import userEvent from "@testing-library/user-event";
import { ErrorContext } from "contexts/ErrorContext";

jest.mock("next/router");
let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Project() {
    return {
      rowId: "1",
      projectName: "Project 1",
      proposalReference: "00000",
      totalFundingRequest: "1.00",
      summary: "Summary 1",
      operatorByOperatorId: {
        legalName: "Operator 1 legal name",
        bcRegistryId: "BC1234567",
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
              fullPhone: "1234567890",
              email: "one@email.com",
            },
          },
          {
            node: {
              id: "2",
              fullName: "Contact full name 2",
              fullPhone: "2345678901",
              email: "two@email.com",
            },
          },
          {
            node: {
              id: "3",
              fullName: "Contact full name 3",
              fullPhone: "3456789012",
              email: "three@email.com",
            },
          },
        ],
      },
      projectManagersByProjectId: {
        edges: [
          {
            node: {
              cifUserByCifUserId: {
                givenName: "Manager first name 1",
                familyName: "Manager last name 1",
                id: "1",
              },
            },
          },
          {
            node: {
              cifUserByCifUserId: {
                givenName: "Manager first name 2",
                familyName: "Manager last name 2",
                id: "2",
              },
            },
          },
        ],
      },
        
    pendingProjectRevision: {
      id: "1",
    },
  };
  },
};

const loadProjectQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: ProjectOverviewQuery$variables = {
    project: "mock-project-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(compiledProjectViewQuery, variables);
  initialQueryRef = loadQuery<ProjectOverviewQuery>(
    environment,
    compiledProjectViewQuery,
    variables
  );
};

let errorContext;
const renderProjectPage = () =>
  render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <ProjectViewPage CSN preloadedQuery={initialQueryRef} />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );

describe("ProjectViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          errorContext.error = error;
        })
      ),
    };
    jest.restoreAllMocks();
  });

  it("displays an error when the Edit button is clicked & createProjectRevisionMutation fails", async () => {
    loadProjectQuery({
      Project() {
        return {
          rowId: "1",
          projectName: "Project 1",
          proposalReference: "00000",
          totalFundingRequest: "1.00",
          summary: "Summary 1",
          operatorByOperatorId: {
            legalName: "Operator 1 legal name",
            bcRegistryId: "BC1234567",
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
                  fullPhone: "1234567890",
                  email: "one@email.com",
                },
              },
              {
                node: {
                  id: "2",
                  fullName: "Contact full name 2",
                  fullPhone: "2345678901",
                  email: "two@email.com",
                },
              },
              {
                node: {
                  id: "3",
                  fullName: "Contact full name 3",
                  fullPhone: "3456789012",
                  email: "three@email.com",
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
          pendingProjectRevision: null,
        };
      },
    });
    renderProjectPage();
    userEvent.click(screen.getByText(/Edit/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to edit the project."
      )
    ).toBeVisible();
  });

  it("displays the project details", () => {
    loadProjectQuery();
    renderProjectPage();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/00000/i)).toBeInTheDocument();
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

  it("renders null if the project doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );
    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
    loadProjectQuery({
      Query() {
        return {
          project: null,
        };
      },
    });

    const { container } = renderProjectPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
