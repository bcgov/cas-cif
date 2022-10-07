import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectRevisionCreate } from "pages/cif/project-revision/[projectRevision]/project-revision-create";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledprojectRevisionCreateNewQuery, {
  projectRevisionCreateNewQuery,
} from "__generated__/projectRevisionCreateNewQuery.graphql";

const defaultMockResolver = {
  Project() {
    return {
      pendingNewProjectRevision: "mock-revision-id",
    };
  },
};

const pageTestingHelper = new PageTestingHelper<projectRevisionCreateNewQuery>({
  pageComponent: ProjectRevisionCreate,
  compiledQuery: compiledprojectRevisionCreateNewQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "test-cif-project-revision",
  },
});

describe("The project amendments and revisions page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("loads the New Revision Butto2n", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("radio", {
        name: /Amendment/i,
      })
    ).toBeInTheDocument();
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

  it("Triggers the projectRevisionCreateNewQuery and redirects when the user clicks the new revision button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    userEvent.click(
      screen.getAllByRole("button", { name: /new revision/i })[0]
    );

    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    expect(operation.fragment.node.name).toBe("projectRevisionCreateNewQuery");
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: { projectRevision: "mock-revision-id", formIndex: 0 },
      anchor: undefined,
    });
  });
});
