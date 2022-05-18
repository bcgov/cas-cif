import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";
import { getProjectRevisionPageRoute } from "pageRoutes";
import { ProjectQuarterlyReportsPage } from "pages/cif/project-revision/[projectRevision]/form/quarterly-reports";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledQuarterlyReportsFormQuery, {
  quarterlyReportsFormQuery,
} from "__generated__/quarterlyReportsFormQuery.graphql";

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
      projectByProjectId: {
        proposalReference: "001",
      },
      projectFormChange: {
        id: `mock-project-form-${generateId()}`,
        newFormData: {
          someProjectData: "test2",
        },
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<quarterlyReportsFormQuery>({
  pageComponent: ProjectQuarterlyReportsPage,
  compiledQuery: compiledQuarterlyReportsFormQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Quarterly Reports page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the task list in the left navigation with correct highlighting", () => {
    const mockPathname =
      "/cif/project-revision/[projectRevision]/form/quarterly-reports";
    pageTestingHelper.setRouterOptions({
      pathname: mockPathname,
    });

    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Editing: 001/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Edit quarterly reports/i).closest("li")
    ).toHaveAttribute("aria-current", "step");
  });

  it("redirects the user to the project revision page on submit", () => {
    let handleSubmit;
    jest
      .spyOn(require("components/Form/ProjectQuarterlyReportForm"), "default")
      .mockImplementation((props: any) => {
        handleSubmit = () => props.onSubmit();
        return null;
      });
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    handleSubmit();
    expect(pageTestingHelper.router.push).toHaveBeenCalledWith(
      getProjectRevisionPageRoute("mock-proj-rev-2")
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
