import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { ProjectFundingAgreementFormSummary_projectRevision$data } from "__generated__/ProjectFundingAgreementFormSummary_projectRevision.graphql";
import compiledProjectFundingAgreementFormSummaryQuery, {
  ProjectFundingAgreementFormSummaryTestQuery,
} from "__generated__/ProjectFundingAgreementFormSummaryTestQuery.graphql";
import ProjectFundingAgreementFormSummary from "components/Form/ProjectFundingAgreementFormSummary";
import projectFundingParameterEPSchema from "/schema/data/prod/json_schema/funding_parameter_EP.json";
import projectFundingParameterIASchema from "/schema/data/prod/json_schema/funding_parameter_IA.json";

const testQuery = graphql`
  query ProjectFundingAgreementFormSummaryTestQuery @relay_test_operation {
    query {
      ...ProjectFundingAgreementFormSummary_query
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectFundingAgreementFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayloadEP = {
  ProjectRevision() {
    const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        projectFormChange: {
          asProject: {
            fundingStreamRfpByFundingStreamRfpId: {
              fundingStreamByFundingStreamId: {
                name: "EP",
              },
            },
          },
        },
        summaryProjectFundingAgreementFormChanges: {
          edges: [
            {
              node: {
                proponentsSharePercentage: 5, // will trigger three diffs
                totalProjectValue: 6, // will trigger three diffs
                newFormData: {
                  projectId: "Test Project ID",
                  maxFundingAmount: 200,
                  provinceSharePercentage: 60,
                  holdbackPercentage: 20.15,
                  anticipatedFundingAmount: 300,
                  proponentCost: 100,
                  contractStartDate: "2021-02-02T23:59:59.999-07:00",
                  projectAssetsLifeEndDate: "2021-12-31T23:59:59.999-07:00",
                  additionalFundingSources: [
                    {
                      source: "Test Source Name",
                      amount: 2500,
                      status: "Approved",
                    },
                  ],
                },
                eligibleExpensesToDate: "1.00",
                holdbackAmountToDate: "0.00",
                netPaymentsToDate: "1.00",
                grossPaymentsToDate: "1.00",
                isPristine: false,
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  proponentsSharePercentage: 10, // will trigger three diffs
                  totalProjectValue: 12, // will trigger three diffs
                  newFormData: {
                    projectId: "Test Project ID",
                    maxFundingAmount: 200,
                    provinceSharePercentage: 50,
                    holdbackPercentage: 10.23,
                    anticipatedFundingAmount: 300,
                    proponentCost: 100,
                    contractStartDate: "2021-01-01T23:59:59.999-07:00",
                    projectAssetsLifeEndDate: "2021-12-31T23:59:59.999-07:00",
                    additionalFundingSources: [
                      {
                        source: "Test Source Name",
                        amount: 1000,
                        status: "Awaiting Approval",
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        latestCommittedFundingFormChanges: {
          edges: [
            {
              node: {
                proponentsSharePercentage: 15, // will trigger three diffs
                totalProjectValue: 18, // will trigger three diffs
                newFormData: {
                  // add data as required
                },
                eligibleExpensesToDate: "1.00",
                holdbackAmountToDate: "0.00",
                netPaymentsToDate: "1.00",
                grossPaymentsToDate: "1.00",
                isPristine: false,
                operation: "UPDATE",
              },
            },
          ],
        },
      };
    return result;
  },
  Query() {
    return {
      epFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterEPSchema,
      },
      iaFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterIASchema,
      },
    };
  },
};

const mockQueryPayloadIA = {
  ProjectRevision() {
    const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        projectFormChange: {
          asProject: {
            fundingStreamRfpByFundingStreamRfpId: {
              fundingStreamByFundingStreamId: {
                name: "IA",
              },
            },
          },
        },
        summaryProjectFundingAgreementFormChanges: {
          edges: [
            {
              node: {
                proponentsSharePercentage: 7, // will trigger three diffs
                totalProjectValue: 8, // will trigger three diffs
                newFormData: {
                  projectId: "Test Project ID",
                  maxFundingAmount: 501,
                  provinceSharePercentage: 60,
                  anticipatedFundingAmount: 200,
                  proponentCost: 100,
                  contractStartDate: "2021-02-02T23:59:59.999-07:00",
                  projectAssetsLifeEndDate: "2023-03-28T14:41:23.626132-07:00",
                },
                calculatedTotalPaymentAmountToDate: "511.0",
                isPristine: false,
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  proponentsSharePercentage: 14, // will trigger three diffs
                  totalProjectValue: 16, // will trigger three diffs
                  newFormData: {
                    projectId: "Test Project ID",
                    maxFundingAmount: 500,
                    provinceSharePercentage: 50,
                    anticipatedFundingAmount: 200,
                    proponentCost: 100,
                    contractStartDate: "2021-01-01T23:59:59.999-07:00",
                    projectAssetsLifeEndDate:
                      "2023-03-28T14:41:23.626132-07:00",
                  },
                },
              },
            },
          ],
        },
        latestCommittedFundingFormChanges: {
          edges: [
            {
              node: {
                proponentsSharePercentage: 21, // will trigger three diffs
                totalProjectValue: 24, // will trigger three diffs
                newFormData: {},
                calculatedTotalPaymentAmountToDate: "511.0",
                isPristine: false,
                operation: "UPDATE",
              },
            },
          ],
        },
        summaryAdditionalFundingSourceFormChanges: {
          edges: [],
        },
      };
    return result;
  },
  Query() {
    return {
      epFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterEPSchema,
      },
      iaFundingParameterFormBySlug: {
        jsonSchema: projectFundingParameterIASchema,
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectFundingAgreementFormSummaryTestQuery>({
    component: ProjectFundingAgreementFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectFundingAgreementFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayloadEP,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Funding Agreement Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed for an EP form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.getByText("Performance Milestone Holdback Percentage")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Proponent's Share Percentage")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Project Value")).toBeInTheDocument();
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
  });

  it("Only displays the data fields that have changed for an IA form", () => {
    componentTestingHelper.loadQuery(mockQueryPayloadIA);
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.getByText("Proponent's Share Percentage")
    ).toBeInTheDocument();
    expect(screen.getByText("Total Project Value")).toBeInTheDocument();
    expect(
      screen.queryByText("Performance Milestone Holdback Percentage")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Maximum Funding Amount")).toBeInTheDocument();
    expect(
      screen.queryByText("Project Assets Life End Date")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Anticipated/Actual Funding Amount")
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Proponent Cost")).not.toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that have changed for an EP form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("50.00 %")).toBeInTheDocument();
    expect(screen.getByText("60.00 %")).toBeInTheDocument();
    expect(screen.getByText("10.23 %")).toBeInTheDocument();
    expect(screen.getByText("20.15 %")).toBeInTheDocument();
    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2021/)).toBeInTheDocument();
    expect(screen.getByText(/Feb[.]? 2, 2021/)).toBeInTheDocument();
    expect(screen.getByText("Approved")).toBeInTheDocument();
    expect(screen.getByText("5.00 %")).toBeInTheDocument(); // new proponentsSharePercentage
    expect(screen.getByText("10.00 %")).toBeInTheDocument(); // old proponentsSharePercentage
    expect(screen.getByText("15.00 %")).toBeInTheDocument(); // latest committed proponentsSharePercentage
    expect(screen.getByText("$6.00")).toBeInTheDocument(); // new totalProjectValue
    expect(screen.getByText("$12.00")).toBeInTheDocument(); // old totalProjectValue
    expect(screen.getByText("$18.00")).toBeInTheDocument(); // latest committed totalProjectValue
  });

  it("Displays diffs of the the data fields that have changed for an IA form", () => {
    componentTestingHelper.loadQuery(mockQueryPayloadIA);
    componentTestingHelper.renderComponent();

    expect(screen.getByText("50.00 %")).toBeInTheDocument();
    expect(screen.getByText("60.00 %")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument(); //max funding changes
    expect(screen.getByText("$501.00")).toBeInTheDocument(); // max funding changes
    expect(screen.getByText(/Jan[.]? 1, 2021/)).toBeInTheDocument();
    expect(screen.getByText("7.00 %")).toBeInTheDocument(); // new proponent's share percentage
    expect(screen.getByText("14.00 %")).toBeInTheDocument(); // old proponent's share percentage
    expect(screen.getByText("21.00 %")).toBeInTheDocument(); // latest committed proponent's share percentage

    expect(screen.getByText("$8.00")).toBeInTheDocument(); // new total project value
    expect(screen.getByText("$16.00")).toBeInTheDocument(); // old total project value
    expect(screen.getByText("$24.00")).toBeInTheDocument(); // latest committed total project value
  });

  it("Displays all data for an EP project when isFirstRevision is true (Project Creation)", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
          {
            isFirstRevision: true,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "EP",
                  },
                },
              },
            },
            formChangesByProjectRevisionId: {
              edges: [
                {
                  node: {
                    anticipatedFundingAmountPerFiscalYear: {
                      edges: [
                        {
                          node: {
                            anticipatedFundingAmount: "5",
                            fiscalYear: "2021/2022",
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            summaryProjectFundingAgreementFormChanges: {
              edges: [
                {
                  node: {
                    proponentsSharePercentage: 77,
                    totalProjectValue: 777,
                    newFormData: {
                      projectId: "Test Project ID",
                      maxFundingAmount: 200,
                      provinceSharePercentage: 60,
                      holdbackPercentage: 20.15,
                      anticipatedFundingAmount: 300,
                      proponentCost: 800,
                      contractStartDate: "2021-01-01",
                      projectAssetsLifeEndDate: "2021-12-31",
                      additionalFundingSources: [
                        {
                          source: "Test Source Name",
                          amount: 2500,
                          status: "Awaiting Approval",
                        },
                      ],
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
      Query() {
        return {
          epFundingParameterFormBySlug: {
            jsonSchema: projectFundingParameterEPSchema,
          },
          iaFundingParameterFormBySlug: {
            jsonSchema: projectFundingParameterIASchema,
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Total Project Value")).toBeInTheDocument();
    expect(
      screen.getByText("Proponent's Share Percentage")
    ).toBeInTheDocument();
    expect(screen.getByText("Maximum Funding Amount")).toBeInTheDocument();
    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.getByText("Performance Milestone Holdback Percentage")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Anticipated/Actual Funding Amount")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$5.00");
    expect(screen.getByText("Proponent Cost")).toBeInTheDocument();
    expect(screen.getByText("Contract Start Date")).toBeInTheDocument();
    expect(
      screen.getByText("Project Assets Life End Date")
    ).toBeInTheDocument();
    expect(screen.getByText(/additional funding amount/i)).toBeInTheDocument();
    expect(screen.getByText(/additional funding status/i)).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding source 1/i)
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Total Eligible Expenses to Date/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Gross Payment Amount to Date/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Holdback Amount to Date/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Net Payment Amount to Date/i)
    ).toBeInTheDocument();
  });

  it("Displays all data for an IA project when isFirstRevision is true (Project Creation)", () => {
    componentTestingHelper.loadQuery({
      ...mockQueryPayloadIA,
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
          {
            isFirstRevision: true,
            projectFormChange: {
              asProject: {
                fundingStreamRfpByFundingStreamRfpId: {
                  fundingStreamByFundingStreamId: {
                    name: "IA",
                  },
                },
              },
            },
            formChangesByProjectRevisionId: {
              edges: [
                {
                  node: {
                    anticipatedFundingAmountPerFiscalYear: {
                      edges: [
                        {
                          node: {
                            anticipatedFundingAmount: "5",
                            fiscalYear: "2021/2022",
                          },
                        },
                      ],
                    },
                  },
                },
              ],
            },
            summaryProjectFundingAgreementFormChanges: {
              edges: [
                {
                  node: {
                    totalProjectValue: 63,
                    proponentsSharePercentage: 54,
                    newFormData: {
                      projectId: "Test Project ID",
                      maxFundingAmount: 200,
                      provinceSharePercentage: 60,
                      anticipatedFundingAmount: 300,
                      proponentCost: 800,
                      contractStartDate: "2021-01-01",
                      projectAssetsLifeEndDate: "2021-12-31",
                      additionalFundingSources: [
                        {
                          source: "Test Source Name",
                          amount: 2500,
                          status: "Awaiting Approval",
                        },
                      ],
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
    expect(
      screen.getByText("Proponent's Share Percentage")
    ).toBeInTheDocument();
    expect(screen.getByText("Maximum Funding Amount")).toBeInTheDocument();
    expect(screen.getByText("Province's Share Percentage")).toBeInTheDocument();
    expect(
      screen.queryByText("Performance Milestone Holdback Percentage")
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Anticipated/Actual Funding Amount")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText<HTMLLabelElement>(
        /Anticipated Funding Amount Per Fiscal Year 1 \(2021\/2022\)/i
      )
    ).toHaveTextContent("$5.00");
    expect(screen.getByText("Proponent Cost")).toBeInTheDocument();
    expect(screen.getByText("Contract Start Date")).toBeInTheDocument();
    expect(
      screen.getByText("Project Assets Life End Date")
    ).toBeInTheDocument();
    expect(screen.getByText(/additional funding amount/i)).toBeInTheDocument();
    expect(screen.getByText(/additional funding status/i)).toBeInTheDocument();
    expect(
      screen.getByText(/additional funding source 1/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Total Payment Amount to Date/i)
    ).toBeInTheDocument();
  });

  it("Displays relevant message when funding agreement not added", () => {
    componentTestingHelper.loadQuery({
      ...mockQueryPayloadEP,
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
          {
            isFirstRevision: true,
            summaryProjectFundingAgreementFormChanges: {
              edges: [],
            },
          };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText(/budgets, expenses & payments not added/i)
    ).toBeInTheDocument();
  });
  it("Displays relevant message when funding agreement not updated", () => {
    componentTestingHelper.loadQuery({
      ...mockQueryPayloadEP,
      ProjectRevision() {
        const result: Partial<ProjectFundingAgreementFormSummary_projectRevision$data> =
          {
            isFirstRevision: false,
            summaryProjectFundingAgreementFormChanges: {
              edges: [],
            },
          };
        return result;
      },
    });
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText(/budgets, expenses & payments not updated/i)
    ).toBeInTheDocument();
  });
  it("Displays relevant message when funding agreement removed", () => {
    componentTestingHelper.loadQuery({
      ...mockQueryPayloadEP,
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
                      holdbackPercentage: 20.15,
                      anticipatedFundingAmount: 300,
                      proponentCost: 100,
                      contractStartDate: "2021-02-02T23:59:59.999-07:00",
                      projectAssetsLifeEndDate: "2021-12-31T23:59:59.999-07:00",
                    },
                    isPristine: false,
                    operation: "ARCHIVE",
                    formChangeByPreviousFormChangeId: {
                      newFormData: {
                        projectId: "Test Project ID",
                        maxFundingAmount: 200,
                        provinceSharePercentage: 50,
                        holdbackPercentage: 10.23,
                        anticipatedFundingAmount: 300,
                        proponentCost: 100,
                        contractStartDate: "2021-01-01T23:59:59.999-07:00",
                        projectAssetsLifeEndDate:
                          "2021-12-31T23:59:59.999-07:00",
                      },
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

    expect(
      screen.getByText(/budgets, expenses & payments removed/i)
    ).toHaveClass("diffOld");
  });
});
