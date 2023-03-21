import "@testing-library/jest-dom";
import { screen, within } from "@testing-library/react";

import PageTestingHelper from "tests/helpers/pageTestingHelper";
import externalCompiledQuery from "__generated__/viewExternalProjectRevisionQuery.graphql";
import ExternalProjectFormPage from "pages/cif-external/project-revision/[projectRevision]/view";
import { FormIndexPageQuery } from "__generated__/FormIndexPageQuery.graphql";

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

const externalPageTestingHelper = new PageTestingHelper<FormIndexPageQuery>({
  pageComponent: ExternalProjectFormPage,
  compiledQuery: externalCompiledQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    projectRevision: "mock-id",
  },
});

describe("The Project Overview Page (external)", () => {
  beforeEach(() => {
    externalPageTestingHelper.reinit();
    externalPageTestingHelper.setMockRouterValues({
      pathname: "/cif-external/project-revision/[projectRevision]/view",
      query: { projectRevision: "mock-id" },
    });
  });

  it("renders the task list in the left navigation", () => {
    externalPageTestingHelper.loadQuery();
    externalPageTestingHelper.renderPage();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Application Overview/i)
    ).toBeInTheDocument();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Attachments/i)
    ).toBeInTheDocument();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Review/i)
    ).toBeInTheDocument();

    expect(screen.getByText("< Return to Dashboard")).toBeInTheDocument();

    expect(
      within(
        screen.getByRole("navigation", { name: "side navigation" })
      ).getByText(/Declaration/i)
    ).toBeInTheDocument();
  });

  it("renders the next button", () => {
    externalPageTestingHelper.loadQuery();
    externalPageTestingHelper.renderPage();
    expect(
      screen.getByRole("button", {
        name: /next/i,
      })
    ).toBeInTheDocument();
  });
});
