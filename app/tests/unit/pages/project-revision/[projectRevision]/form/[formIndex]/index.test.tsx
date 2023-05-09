import "@testing-library/jest-dom";
import { cleanup, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  getProjectRevisionFormPageRoute,
  getProjectRevisionViewPageRoute,
} from "routes/pageRoutes";
import ProjectFormPage from "pages/cif/project-revision/[projectRevision]/form/[formIndex]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import projectFundingParameterEPSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";

/***
 * https://relay.dev/docs/next/guides/testing-relay-with-preloaded-queries/#configure-the-query-resolver-to-generate-the-response
 * To find the key of the generated operation, one can call
 * `console.log(JSON.stringify(operation, null, 2))`
 * just before returning the MockPayloadGenerator and looking for concreteType instances *
 */

const defaultMockResolver = {
  ProjectRevision() {
    return {
      id: `mock-proj-rev-1`,
      projectId: 123,
      changeStatus: "pending",
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: `mock-project-form-2`,
        newFormData: {
          someProjectData: "test2",
        },
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            fundingStreamByFundingStreamId: {
              name: "EP",
            },
          },
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
  Form() {
    return {
      rowId: 15,
      jsonSchema: projectFundingParameterEPSchema,
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

describe("The form index page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    pageTestingHelper.setMockRouterValues({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: { projectRevision: "mock-id", formIndex: "1" },
    });
  });

  it("renders the task list in the left navigation with correct highlighting", async () => {
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
      query: { projectRevision: "mock-id", formIndex: "3" },
    });
    pageTestingHelper.renderPage();
    expect(
      screen.getByText(/edit budgets, expenses & payments/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("redirects the user to the project revision page on submit when editing", async () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    await userEvent.click(screen.getByText(/submit project managers/i));
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionViewPageRoute("mock-proj-rev-1")
    );
  });

  it("redirects the user to the next page on submit when creating a project", async () => {
    pageTestingHelper.loadQuery({
      ProjectRevision() {
        return {
          id: "mock-proj-rev-id",
          projectId: null,
          projectByProjectId: null,
          projectFormChange: {
            id: `mock-project-form-3`,
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

  it("does not render the next button", () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: null,
        };
      },
    });
    expect(screen.queryByText(/next/i)).not.toBeInTheDocument();
  });

  it("uses the correct formStructure (shows the internal user form)", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    // for internal users, formIndex 1 is the project managers form
    expect(screen.getByText(/Submit Project Managers/i)).toBeInTheDocument();
  });
});
