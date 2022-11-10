import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { ProjectRevisionChangeLogs } from "pages/cif/project-revision/[projectRevision]/project-revision-change-logs";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectRevisionChangeLogsQuery, {
  projectRevisionChangeLogsQuery,
} from "__generated__/projectRevisionChangeLogsQuery.graphql";

const defaultMockResolver = {
  Project() {
    return {
      id: "test-cif-project",
      projectRevisionChangeLogs: {
        totalCount: 1,
        edges: [
          {
            node: {
              id: "1",
              revisionType: "revision-type-1",
              createdAt: "2021-01-01T23:59:59.999-07:00",
              revisionStatus: "revision-status-1",
              effectiveDate: "2021-02-01T23:59:59.999-07:00",
              updatedAt: "2021-02-01T23:59:59.999-07:00",
              cifUserByUpdatedBy: { fullName: "test-user-1" },
              projectRevisionAmendmentTypesByProjectRevisionId: {
                edges: [
                  { node: { amendmentType: "amendment-type-1" } },
                  { node: { amendmentType: "amendment-type-2" } },
                ],
              },
            },
          },
        ],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<projectRevisionChangeLogsQuery>(
  {
    pageComponent: ProjectRevisionChangeLogs,
    compiledQuery: compiledProjectRevisionChangeLogsQuery,
    defaultQueryResolver: defaultMockResolver,
    defaultQueryVariables: {
      projectRevision: "test-cif-project-revision",
      offset: null,
      pageSize: DEFAULT_PAGE_SIZE,
      orderBy: null,
      revisionType: null,
      fullName: null,
      revisionStatus: null,
      amendmentType: null,
    },
  }
);

describe("The project amendments and revisions page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders a table with all the amendments and revisions", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    // 4 rows: 1 header, 1 filter, 1 for the pagination, and 1 for the amendment and revision
    expect(screen.getAllByRole("row")).toHaveLength(4);
  });

  it("loads the New Revision Button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("button", {
        name: /new revision/i,
      })
    ).toBeInTheDocument();
  });

  it("renders the correct filters", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.queryByLabelText(/filter by type/i)).toBeInTheDocument();
    expect(
      screen.queryByLabelText(/filter by updated by/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Filter by Updated")).toBeInTheDocument();
    expect(screen.queryByLabelText(/filter by status/i)).toBeInTheDocument();
  });

  it("renders the page with the revision type query variable from the type filter", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.type(screen.getAllByRole("combobox")[0], "Minor");
    userEvent.click(screen.getByText(/Apply/i));

    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("projectRevisionChangeLogsQuery");
    expect(operation.fragment.variables.revisionType).toBe("Minor");
  });
  // TODO: Add tests when `New Revision` button is implemented
});
