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
      pendingGeneralRevision: null,
      pendingAmendment: null,
    };
  },
  ProjectRevision() {
    return {
      id: "test-project-revision",
      rowId: 1234,
    };
  },
  Query() {
    return {
      allRevisionTypes: {
        totalCount: 3,
        edges: [
          { node: { id: "1", type: "Amendment" } },
          { node: { id: "2", type: "General Revision" } },
        ],
      },
      allAmendmentTypes: {
        totalCount: 3,
        edges: [
          { node: { id: "1", name: "Cost" } },
          { node: { id: "2", name: "Schedule" } },
          { node: { id: "3", name: "Scope" } },
        ],
      },
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

    act(() => {
      userEvent.click(screen.getByLabelText(/general revision/i));
      userEvent.click(
        screen.getAllByRole("button", { name: /new revision/i })[0]
      );
    });
    pageTestingHelper.expectMutationToBeCalled(
      "createProjectRevisionMutation",
      {
        projectId: 1234,
        revisionType: "General Revision",
        amendmentTypes: null,
      }
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
  it("Renders amendment type options when amendment is selected", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByLabelText(/Amendment/i));
    expect(
      screen.getByRole("checkbox", {
        name: /Cost/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /Schedule/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("checkbox", {
        name: /Scope/i,
      })
    ).toBeInTheDocument();
    userEvent.click(
      screen.getAllByRole("button", { name: /new revision/i })[0]
    );
  });
  it("Triggers create revision mutation with correct amendment types", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    act(() => {
      userEvent.click(screen.getByLabelText(/Amendment/i));
      userEvent.click(screen.getByLabelText(/Cost/i));
      userEvent.click(screen.getByLabelText(/Schedule/i));
      userEvent.click(
        screen.getAllByRole("button", { name: /new revision/i })[0]
      );
    });
    pageTestingHelper.expectMutationToBeCalled(
      "createProjectRevisionMutation",
      {
        projectId: 1234,
        revisionType: "Amendment",
        amendmentTypes: ["Cost", "Schedule"],
      }
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
  it("Disables only the amendment revision type if one is already pending", () => {
    pageTestingHelper.loadQuery({
      ...defaultMockResolver,
      Project() {
        return {
          id: "test-project",
          rowId: 2345,
          pendingGeneralRevision: null,
          pendingAmendment: {
            id: 6543,
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    const amendmentRadio = screen.getByRole("radio", { name: /amendment/i });
    const generalRevisionRadio = screen.getByRole("radio", {
      name: /general revision/i,
    });
    expect(amendmentRadio).toBeDisabled();
    expect(generalRevisionRadio).not.toBeDisabled();
  });
  it("Does not render the create form if a general revision and amendment are both already in progress", () => {
    pageTestingHelper.loadQuery({
      ...defaultMockResolver,
      Project() {
        return {
          id: "test-project",
          rowId: 3456,
          pendingGeneralRevision: {
            id: 8765,
          },
          pendingAmendment: {
            id: 6543,
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.queryByText("Revision Type")).not.toBeInTheDocument();
    expect(
      screen.getByText(/There is an existing amendment and general revision/i)
    ).toBeInTheDocument();
  });
});
