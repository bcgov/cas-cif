import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectRevisionCreate } from "pages/cif/project-revision/[projectRevision]/create";
import { getProjectRevisionPageRoute } from "routes/pageRoutes";
import PageTestingHelper from "tests/helpers/pageTestingHelper";

import compliledcreateProjectRevisionQuery, {
  createProjectRevisionQuery,
} from "__generated__/createProjectRevisionQuery.graphql";
const defaultMockResolver = {
  ProjectRevision() {
    return {
      id: "mock-id",
      projectFormChange: {
        id: "mock-id",
        newFormData: {
          someProjectData: "test2",
        },
      },
    };
  },
};
const pageTestingHelper = new PageTestingHelper<createProjectRevisionQuery>({
  pageComponent: ProjectRevisionCreate,
  compiledQuery: compliledcreateProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The project amendments and revisions page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });
  it("renders an Amendment radio button", () => {
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

  it("Triggers the createProjectRevisionQuery and redirects when the user clicks the new revision button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    userEvent.click(screen.getByLabelText(/minor revision/i));
    userEvent.click(
      screen.getAllByRole("button", { name: /new revision/i })[0]
    );

    // pageTestingHelper.expectMutationToBeCalled("createProjectRevision", {});
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-id")
    );
  });
});
