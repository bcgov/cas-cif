import "@testing-library/jest-dom";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectsQuery, {
  projectsQuery,
} from "__generated__/projectsQuery.graphql";
import { Projects } from "../../../pages/cif/projects";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allProjects: {
        totalCount: 2,
        edges: [
          { node: { id: "1", projectName: "Project 1" } },
          { node: { id: "2", projectName: "Project 2" } },
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
    operatorTradeName: null,
    proposalReference: null,
    status: null,
    projectManagers: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
  },
});

describe("The projects page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("renders the list of projects", () => {
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

  it("calls the Add a Project mutation when the Add a Project Button is clicked", () => {
    const spy = jest.spyOn(
      require("mutations/Project/createProject"),
      "useCreateProjectMutation"
    );

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Add a Project/i));
    expect(spy).toHaveBeenCalled();
  });

  it("displays an error when the Add a Project is clicked & createProjectMutation fails", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Add a Project/i));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the project."
      )
    ).toBeVisible();
  });

  it("renders the correct filters", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.queryByLabelText("Filter by Project Name")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Operator Trade Name")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Proposal Reference")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by Status")).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Project Managers")
    ).toBeInTheDocument();
  });

  it("applys correct filter variables, to mutation", () => {
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
