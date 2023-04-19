import { screen } from "@testing-library/react";
import { ExternalProjectRevisionSummary } from "pages/cif-external/project-revision/[projectRevision]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledProjectRevisionExternalSummaryQuery, {
  ProjectRevisionExternalSummaryQuery,
} from "__generated__/ProjectRevisionExternalSummaryQuery.graphql";

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
          projectName: "My Fancy Project",
          legalName: "Optimus Prime",
          fundingStreamRfpId: 7,
        },
        asProject: {
          fundingStreamRfpByFundingStreamRfpId: {
            year: 2023,
            fundingStreamByFundingStreamId: {
              description: "RFP Description",
            },
          },
        },
      },
    };
  },
};

const pageTestingHelper =
  new PageTestingHelper<ProjectRevisionExternalSummaryQuery>({
    pageComponent: ExternalProjectRevisionSummary,
    compiledQuery: compiledProjectRevisionExternalSummaryQuery,
    defaultQueryResolver: defaultMockResolver,
    defaultQueryVariables: {
      projectRevision: "mock-id",
    },
  });

describe("External Review Page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("displays review statement", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(
      screen.getByText(/Review your responses to ensure correct submission./i)
    ).toBeInTheDocument();
  });

  it("displays the application form review", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(screen.getByText(/RFP Year ID/i)).toBeInTheDocument();
    expect(screen.getByText(/RFP Description - 2023/i)).toBeInTheDocument();
    expect(screen.getByText(/Project Name/i)).toBeInTheDocument();
    expect(screen.getByText(/My Fancy Project/i)).toBeInTheDocument();
    expect(screen.getByText(/Legal name/i)).toBeInTheDocument();
    expect(screen.getByText(/Optimus Prime/i)).toBeInTheDocument();
  });
});
