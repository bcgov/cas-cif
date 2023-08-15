import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { getNewProjectRevisionPageRoute } from "routes/pageRoutes";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectsQuery, {
  projectsQuery,
} from "__generated__/projectsQuery.graphql";
import { Projects } from "../../../pages/cif/projects";

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allProjects: {
        totalCount: 2,
        edges: [
          {
            node: {
              id: "1",
              projectName: "Project 1",
            },
          },
          {
            node: {
              id: "2",
              projectName: "Project 2",
              projectManagersByProjectId: {
                edges: [],
              },
            },
          },
        ],
      },
      pendingNewProjectRevision: null,
    };
  },
};

const pageTestingHelper = new PageTestingHelper<projectsQuery>({
  pageComponent: Projects,
  compiledQuery: compiledProjectsQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectName: null,
    operatorLegalName: null,
    proposalReference: null,
    status: null,
    primaryProjectManager: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
    milestoneStatus: null,
  },
});

describe("The projects page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("renders the list of projects, including projects with no primary manager", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Project 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Project 2/i)).toBeInTheDocument();
  });

  it("loads the Add a Project Button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Add a Project/i)).toBeInTheDocument();
  });

  it("renders the Resume Project Draft button if a draft exists", () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          session: { cifUserBySub: {} },
          allProjects: {
            totalCount: 0,
            edges: [],
          },
          pendingNewProjectRevision: {
            id: "123",
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/resume project draft/i)).toBeInTheDocument();
    expect(screen.queryByText(/add a project/i)).toBeNull();
  });

  it("Redirects to the New Project page when the Add a Project Button is clicked", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Add a Project/i));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getNewProjectRevisionPageRoute()
    );
  });

  it("renders the correct filters", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.queryByLabelText("Filter by Project Name")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Operator Legal Name")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Proposal Reference")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by Status")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Primary Project Managers")
    ).toBeInTheDocument();
    expect(screen.getByText("Milestone Due")).toHaveAttribute(
      "aria-sort",
      "none"
    );
    userEvent.click(screen.getByText("Milestone Due"));
    waitFor(() => {
      expect(screen.findByText("Milestone Due")).toHaveAttribute(
        "aria-sort",
        "descending"
      );
    });
  });

  it("renders the page with the status query variable from the status filter", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.type(screen.getAllByRole("combobox")[0], "Wait");
    userEvent.click(screen.getByText(/Apply/i));

    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("projectsQuery");
    expect(operation.fragment.variables.status).toBe("Wait");
  });
});
