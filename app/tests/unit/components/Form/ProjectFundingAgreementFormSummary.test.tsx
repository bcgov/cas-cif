import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { ProjectFundingAgreementFormSummary_projectRevision$data } from "__generated__/ProjectFundingAgreementFormSummary_projectRevision.graphql";
import compiledProjectFundingAgreementFormSummaryQuery, {
  ProjectFundingAgreementFormSummaryQuery,
} from "__generated__/ProjectFundingAgreementFormSummaryQuery.graphql";
import ProjectFundingAgreementFormSummary from "components/Form/ProjectFundingAgreementFormSummary";

const testQuery = graphql`
  query ProjectFundingAgreementFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectFundingAgreementFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        summaryProjectFundingAgreementFormChanges: {
          edges: [
            {
              node: {
                newFormData: {
                  projectId: "Test Project ID",
                  totalProjectValue: 400,
                  maxFundingAmount: 200,
                  provinceSharePercentage: 60,
                  holdbackPercentage: 20,
                  anticipatedFundingAmount: 300,
                },
                isPristine: false,
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    projectId: "Test Project ID",
                    totalProjectValue: 500,
                    maxFundingAmount: 200,
                    provinceSharePercentage: 50,
                    holdbackPercentage: 10,
                    anticipatedFundingAmount: 300,
                  },
                },
              },
            },
          ],
        },
      };
    return result;
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectFundingAgreementFormSummaryQuery>({
    component: ProjectFundingAgreementFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectFundingAgreementFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Funding Agreement Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Province Share Percentage")).toBeInTheDocument();
    expect(screen.getByText("Holdback Percentage")).toBeInTheDocument();
    expect(screen.queryByText("Total Project Value")).toBeInTheDocument();

    expect(screen.queryByText("Max Funding Amount")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Anticipated Funding Amount")
    ).not.toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("$400")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
    expect(screen.getByText("50 %")).toBeInTheDocument();
    expect(screen.getByText("60 %")).toBeInTheDocument();
    expect(screen.getByText("10 %")).toBeInTheDocument();
    expect(screen.getByText("20 %")).toBeInTheDocument();
  });

  it("Displays all data when isFirstRevision is true (Project Creation)", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
          {
            isFirstRevision: true,
            summaryProjectFundingAgreementFormChanges: {
              edges: [
                {
                  node: {
                    newFormData: {
                      projectId: "Test Project ID",
                      totalProjectValue: 400,
                      maxFundingAmount: 200,
                      provinceSharePercentage: 60,
                      holdbackPercentage: 20,
                      anticipatedFundingAmount: 300,
                    },
                    isPristine: false,
                    operation: "CREATE",
                    formChangeByPreviousFormChangeId: {
                      newFormData: {},
                    },
                  },
                },
              ],
            },
          };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Total Project Value")).toBeInTheDocument();
    expect(screen.getByText("Max Funding Amount")).toBeInTheDocument();
    expect(screen.getByText("Province Share Percentage")).toBeInTheDocument();
    expect(screen.getByText("Holdback Percentage")).toBeInTheDocument();
    expect(screen.getByText("Anticipated Funding Amount")).toBeInTheDocument();
  });
});
