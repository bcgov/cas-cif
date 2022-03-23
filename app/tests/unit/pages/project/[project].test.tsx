import { ProjectViewPage } from "pages/cif/project/[project]/index";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import compiledProjectViewQuery, {
  ProjectOverviewQuery,
  ProjectOverviewQuery$variables,
} from "__generated__/ProjectOverviewQuery.graphql";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

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

const renderProjectPage = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <ProjectViewPage CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("ProjectViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    jest.restoreAllMocks();
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
