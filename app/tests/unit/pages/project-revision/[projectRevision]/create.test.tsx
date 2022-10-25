import "@testing-library/jest-dom";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProjectRevisionCreate } from "pages/cif/project-revision/[projectRevision]/create";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import { MockPayloadGenerator } from "relay-test-utils";

import compiledCreateProjectRevisionQuery, {
  createProjectRevisionQuery,
} from "__generated__/createProjectRevisionQuery.graphql";
const defaultMockResolver = {
  Project() {
    return {
      id: "test-project",
      rowId: 1234,
    };
  },
  ProjectRevision() {
    return {
      id: "test-project-revision",
      rowId: 1234,
    };
  },
};

const pageTestingHelper = new PageTestingHelper<createProjectRevisionQuery>({
  pageComponent: ProjectRevisionCreate,
  compiledQuery: compiledCreateProjectRevisionQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The project amendments and revisions page", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    pageTestingHelper.reinit();
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

    pageTestingHelper.expectMutationToBeCalled(
      "createProjectRevisionMutation",
      { projectId: 1234, revisionType: "Minor Revision" }
    );
    const operation =
      pageTestingHelper.environment.mock.getMostRecentOperation();
    act(() => {
      pageTestingHelper.environment.mock.resolve(
        operation,
        MockPayloadGenerator.generate(operation)
      );
    });
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: { projectRevision: "<ProjectRevision-mock-id-1>", formIndex: 0 },
      anchor: undefined,
    });
  });
});
