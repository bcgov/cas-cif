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
                  maxFundingAmount: 200,
                  provinceSharePercentage: 60,
                  holdbackPercentage: 20,
                  anticipatedFundingAmount: 300,
                  proponentCost: 100,
                  contractStartDate: "2021-02-02T23:59:59.999-07:00",
                  projectAssetsLifeEndDate: "2021-12-31T23:59:59.999-07:00",
                },
                isPristine: false,
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    projectId: "Test Project ID",
                    maxFundingAmount: 200,
                    provinceSharePercentage: 50,
                    holdbackPercentage: 10,
                    anticipatedFundingAmount: 300,
                    proponentCost: 100,
                    contractStartDate: "2021-01-01T23:59:59.999-07:00",
                    projectAssetsLifeEndDate: "2021-12-31T23:59:59.999-07:00",
                  },
                },
              },
            },
          ],
        },
        summaryAdditionalFundingSourceFormChanges: {
          edges: [
            {
              node: {
                id: "Test Additional Funding Source ID",
                newFormData: {
                  projectId: "Test Project ID",
                  sourceIndex: 1,
                  source: "Test Source Name",
                  amount: 2500,
                  status: "Approved",
                },
                isPristine: false,
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    projectId: "Test Project ID",
                    sourceIndex: 1,
                    source: "Test Source Name",
                    amount: 1000,
                    status: "Awaiting Approval",
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
    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.getByText("Performance Milestone Holdback Percentage")
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Maximum Funding Amount")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Project Assets Life End Date")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Anticipated/Actual Funding Amount")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Proponent Cost")).not.toBeInTheDocument();
    expect(
      screen.getByText(/additional funding amount \(source 1\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding status \(source 1\)/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Additional Funding Source 1")
    ).not.toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("50 %")).toBeInTheDocument();
    expect(screen.getByText("60 %")).toBeInTheDocument();
    expect(screen.getByText("10 %")).toBeInTheDocument();
    expect(screen.getByText("20 %")).toBeInTheDocument();
    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2021/)).toBeInTheDocument();
    expect(screen.getByText(/Feb[.]? 2, 2021/)).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Approval")).toBeInTheDocument();
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
                      maxFundingAmount: 200,
                      provinceSharePercentage: 60,
                      holdbackPercentage: 20,
                      anticipatedFundingAmount: 300,
                      proponentCost: 800,
                      contractStartDate: "2021-01-01",
                      projectAssetsLifeEndDate: "2021-12-31",
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
            summaryAdditionalFundingSourceFormChanges: {
              edges: [
                {
                  node: {
                    id: "Test Additional Funding Source ID",
                    newFormData: {
                      projectId: "Test Project ID",
                      sourceIndex: 1,
                      source: "Test Source Name",
                      amount: 2500,
                      status: "Awaiting Approval",
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
    expect(screen.getByText("Maximum Funding Amount")).toBeInTheDocument();
    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.getByText("Performance Milestone Holdback Percentage")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Anticipated/Actual Funding Amount")
    ).toBeInTheDocument();
    expect(screen.getByText("Proponent Cost")).toBeInTheDocument();
    expect(screen.getByText("Contract Start Date")).toBeInTheDocument();
    expect(
      screen.getByText("Project Assets Life End Date")
    ).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding amount \(source 1\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding status \(source 1\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding source 1/i)
    ).toBeInTheDocument();
  });
});
