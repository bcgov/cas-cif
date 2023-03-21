import "@testing-library/jest-dom";
import { screen } from "@testing-library/react";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledFormIndexExternalPageQuery, {
  FormIndexExternalPageQuery,
} from "__generated__/FormIndexExternalPageQuery.graphql";

import ExternalProjectFormPage from "pages/cif-external/project-revision/[projectRevision]/form/[formIndex]";

const defaultMockResolver = {
  ProjectRevision(context, generateId) {
    return {
      id: `mock-id`,
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
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            fundingStreamByFundingStreamId: {
              name: "EP",
            },
          },
        },
      },
      managerFormChanges: {
        edges: [
          {
            node: {
              projectManagerLabel: {
                id: "Test Label 1 ID",
                rowId: 1,
                label: "Test Label 1",
              },
              formChange: null,
            },
          },
        ],
      },
      milestoneReportStatuses: {
        edges: [],
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<FormIndexExternalPageQuery>({
  pageComponent: ExternalProjectFormPage,
  compiledQuery: compiledFormIndexExternalPageQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The external form index page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    pageTestingHelper.setMockRouterValues({
      pathname: "/cif-external/project-revision/[projectRevision]/view",
      query: { projectRevision: "mock-id", formIndex: "0" },
    });
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

  it("uses the correct formStructure (shows the external user forms)", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      screen.getByText(/Submit Application Overview/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Submit Project Overview/i)
    ).not.toBeInTheDocument();
  });
});
