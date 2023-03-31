import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { getExternalNewProjectRevisionPageRoute } from "routes/pageRoutes";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledcifExternalQuery, {
  cifExternalQuery,
} from "__generated__/cifExternalQuery.graphql";
import { ExternalProjects } from "../../../../../app/pages/cif-external/index";

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

const pageTestingHelper = new PageTestingHelper<cifExternalQuery>({
  pageComponent: ExternalProjects,
  compiledQuery: compiledcifExternalQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectName: null,
    proposalReference: null,
    status: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
  },
});

describe("The external projects page", () => {
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

  it("renders the correct filters", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.queryByLabelText("Filter by Proposal Reference")
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("Filter by Project Name")
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by Status")).toBeInTheDocument();
  });

  it("renders the page with the status query variable from the status filter", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.type(screen.getAllByRole("combobox")[0], "Wait");
    userEvent.click(screen.getByText(/Apply/i));

    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("cifExternalQuery");
    expect(operation.fragment.variables.status).toBe("Wait");
  });

  it("renders the Create Application button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(screen.getByText(/create application/i)).toBeInTheDocument();
  });

  it("Redirects to the New Project page when the Create Application Button is clicked", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Create Application/i));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getExternalNewProjectRevisionPageRoute()
    );
  });
});
