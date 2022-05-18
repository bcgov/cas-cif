import { ProjectViewPage } from "pages/cif/project/[project]/index";
import { screen, act } from "@testing-library/react";
import compiledProjectOverviewQuery, {
  ProjectOverviewQuery,
} from "__generated__/ProjectOverviewQuery.graphql";
import userEvent from "@testing-library/user-event";
import PageTestingHelper from "tests/helpers/pageTestingHelper";

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
              id: "contact-1",
              fullName: "Contact full name 1",
              fullPhone: "1234567890",
              email: "one@email.com",
            },
          },
          {
            node: {
              id: "contact-2",
              fullName: "Contact full name 2",
              fullPhone: "2345678901",
              email: "two@email.com",
            },
          },
          {
            node: {
              id: "contact-3",
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
                fullName: "---- Manager full name 1",
                id: "pm-1",
              },
            },
          },
          {
            node: {
              cifUserByCifUserId: {
                fullName: "Manager full name 2",
                id: "pm-2",
              },
            },
          },
        ],
      },

      pendingProjectRevision: {
        id: "revision-1",
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<ProjectOverviewQuery>({
  pageComponent: ProjectViewPage,
  compiledQuery: compiledProjectOverviewQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: { project: "mock-project-id" },
});

describe("ProjectViewPage", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    pageTestingHelper.reinit();
  });

  it("displays an error when the Edit button is clicked & createProjectRevisionMutation fails", async () => {
    pageTestingHelper.loadQuery({
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
                  id: "contact-1",
                  fullName: "Contact full name 1",
                  fullPhone: "1234567890",
                  email: "one@email.com",
                },
              },
              {
                node: {
                  id: "contact-2",
                  fullName: "Contact full name 2",
                  fullPhone: "2345678901",
                  email: "two@email.com",
                },
              },
              {
                node: {
                  id: "contact-3",
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
                    id: "pm-1",
                  },
                },
              },
              {
                node: {
                  cifUserByCifUserId: {
                    firstName: "Manager first name 2",
                    lastName: "Manager last name 2",
                    id: "pm-2",
                  },
                },
              },
            ],
          },
          pendingProjectRevision: null,
        };
      },
    });

    pageTestingHelper.renderPage();

    userEvent.click(screen.getByText(/Edit/i));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the project revision."
      )
    ).toBeVisible();
  });

  it("displays the project details", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/00000/i)).toBeInTheDocument();
    expect(screen.getByText(/1.00/i)).toBeInTheDocument();
    expect(screen.getByText(/Summary 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 1 trade name/i)).toBeInTheDocument();
    expect(screen.getByText(/2022/i)).toBeInTheDocument();
    expect(screen.getByText(/Emissions Performance/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Review/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 3/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Contact full name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager full name 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Manager full name 2/i)).toBeInTheDocument();
  });

  it("renders null if the project doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );
    pageTestingHelper.loadQuery({
      Query() {
        return {
          project: null,
        };
      },
    });

    const { container } = pageTestingHelper.renderPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(null);
  });
});
