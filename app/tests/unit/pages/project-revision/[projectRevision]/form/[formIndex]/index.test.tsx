import "@testing-library/jest-dom";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getProjectRevisionFormPageRoute,
  getProjectRevisionPageRoute,
} from "routes/pageRoutes";
import ProjectFormPage from "pages/cif/project-revision/[projectRevision]/form/[formIndex]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  ProjectRevision(context, generateId) {
    return {
      id: `mock-proj-rev-${generateId()}`,
      projectId: 123,
      changeStatus: "pending",
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: `mock-project-form-${generateId()}`,
        newFormData: {
          someProjectData: "test2",
        },
      },
      managerFormChanges: {
        edges: [],
      },
      milestoneReportStatuses: {
        edges: [],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<FormIndexPageQuery>({
  pageComponent: ProjectFormPage,
  compiledQuery: compiledFormIndexPageQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Annual Reports page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    pageTestingHelper.setMockRouterValues({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: { projectRevision: "mock-id", formIndex: "1" },
    });
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: 001/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Edit project managers/i).closest("li")
    ).toHaveAttribute("aria-current", "step");

    cleanup();

    pageTestingHelper.setMockRouterValues({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: { projectRevision: "mock-id", formIndex: "4" },
    });

    pageTestingHelper.renderPage();

    expect(
      screen.getByText(/Edit milestone reports/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("redirects the user to the project revision page on submit when editing", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    await userEvent.click(screen.getByText(/submit project managers/i));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-2")
    );
  });

  it("redirects the user to the next page on submit when creating a project", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision(context, generateId) {
        return {
          id: "mock-proj-rev-id",
          projectId: null,
          projectByProjectId: null,
          projectFormChange: {
            id: `mock-project-form-${generateId()}`,
            newFormData: {
              someProjectData: "test2",
            },
          },
          managerFormChanges: {
            edges: [],
          },
        };
      },
    });
    pageTestingHelper.renderPage();
    await userEvent.click(screen.getByText(/submit project managers/i));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionFormPageRoute("mock-proj-rev-id", 2)
    );
  });

  it("renders null and redirects to a 404 page when a revision doesn't exist", async () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });

    const { container } = pageTestingHelper.renderPage();

    expect(container.childElementCount).toEqual(0);
    expect(pageTestingHelper.router.replace).toHaveBeenCalledWith("/404");
  });
});
