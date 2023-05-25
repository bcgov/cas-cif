import { screen } from "@testing-library/react";
import ProjectEmissionIntensityReportFormSummary from "components/Form/ProjectEmissionIntensityReportFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectEmissionIntensityReportFormSummaryQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectEmissionIntensityReportFormSummary_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision() {
    return {
      isFirstRevision: false,
      summaryEmissionIntensityReportingRequirementFormChange: {
        edges: [
          {
            node: {
              id: "1",
              isPristine: false,
              newFormData: {
                comments: "bulbasaur",
                reportType: "TEIMP",
                projectId: 1,
                reportingRequirementIndex: 1,
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  comments: "squirtle",
                  reportType: "TEIMP",
                  projectId: 1,
                  reportingRequirementIndex: 1,
                },
              },
              formDataRecordId: 1,
            },
          },
        ],
      },
      summaryEmissionIntensityReportFormChange: {
        edges: [
          {
            node: {
              id: "2",
              isPristine: false,
              newFormData: {
                reportingRequirementId: 1,
                baselineEmissionIntensity: 0.87654321,
                teimpReporting: {
                  baselineEmissionIntensity: 0.87654321,
                },
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  reportingRequirementId: 1,
                  baselineEmissionIntensity: 0.985145,
                  teimpReporting: {
                    baselineEmissionIntensity: 0.985145,
                  },
                },
              },
            },
          },
        ],
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectEmissionIntensityReportFormSummary,
  testQuery: testQuery,
  compiledQuery: compiledFormIndexPageQuery,
  getPropsFromTestQuery: (data) => ({
    query: data.query,
    projectRevision: data.query.projectRevision,
  }),
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: { projectRevision: "mock-id" },
  defaultComponentProps: defaultComponentProps,
});

describe("the emission intensity report form component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText(/bulbasaur/i)).toBeInTheDocument();
    expect(screen.getByText("squirtle")).toBeInTheDocument();
    expect(
      screen.getByText(/baseline emission intensity \(bei\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("0.985145")).toBeInTheDocument();
    expect(screen.getByText("0.87654321")).toBeInTheDocument();
  });

  it("displays a 'not updated' when there were no updates to the form", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision() {
        return {
          ...defaultMockResolver.ProjectRevision(),

          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [],
          },
          summaryEmissionIntensityReportFormChange: {
            edges: [],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText("Emission Intensity Report not updated")
    ).toBeInTheDocument();
  });

  it("displays the correct data when we have zero values and decimal points on BEI/TEI/PEI and Total Lifetime Emission Reduction and creating an emission intensity report form", () => {
    const customPayload = {
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 2,
                  isPristine: false,
                  newFormData: {
                    teimpReporting: {
                      baselineEmissionIntensity: 0,
                      targetEmissionIntensity: 0.12345678,
                      postProjectEmissionIntensity: 0,
                      totalLifetimeEmissionReduction: 123,
                    },
                  },
                  operation: "CREATE",
                  formChangeByPreviousFormChangeId: {
                    newFormData: {},
                  },
                },
              },
            ],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customPayload);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("Baseline Emission Intensity (BEI)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Target Emission Intensity (TEI)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Post-Project Emission Intensity (PEI) (optional)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Project Lifetime Emissions Reductions (optional)")
    ).toBeInTheDocument();
    screen.logTestingPlaygroundURL();
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getAllByText("0.12345678")).toHaveLength(1);
    expect(screen.getByText("0.12345678")).toHaveClass("diffNew");
    expect(screen.getAllByText("123.00000000")).toHaveLength(1);
    expect(screen.getByText("123.00000000")).toHaveClass("diffNew");
  });

  it("displays the correct data when we have zero values and decimal points on BEI/TEI/PEI and Total Lifetime Emission Reduction and updating an emission intensity report form", () => {
    const customPayload = {
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 2,
                  isPristine: false,
                  newFormData: {
                    baselineEmissionIntensity: 0.87654321,
                    targetEmissionIntensity: 0,
                    teimpReporting: {
                      baselineEmissionIntensity: 0.87654321,
                      targetEmissionIntensity: 0,
                    },
                  },
                  operation: "UPDATE",
                  formChangeByPreviousFormChangeId: {
                    newFormData: {
                      baselineEmissionIntensity: 0,
                      targetEmissionIntensity: 0.12345678,
                      postProjectEmissionIntensity: 654,
                      totalLifetimeEmissionReduction: 456,
                      teimpReporting: {
                        baselineEmissionIntensity: 0,
                        targetEmissionIntensity: 0.12345678,
                        postProjectEmissionIntensity: 654,
                        totalLifetimeEmissionReduction: 456,
                      },
                    },
                  },
                },
              },
            ],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customPayload);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText("Baseline Emission Intensity (BEI)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Target Emission Intensity (TEI)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Post-Project Emission Intensity (PEI) (optional)")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Total Project Lifetime Emissions Reductions (optional)")
    ).toBeInTheDocument();

    screen.logTestingPlaygroundURL();
    expect(screen.getAllByText("0.0")).toHaveLength(1);
    expect(screen.getAllByText("0.00000000")[0]).toHaveClass("diffNew");
    expect(screen.getAllByText("0")[1]).toHaveClass("diffNew");
    expect(screen.getByText("0.87654321")).toHaveClass("diffNew");
    expect(screen.getByText("0.12345678")).toHaveClass("diffOld");
    expect(screen.getByText("654")).toHaveClass("diffOld");
    expect(screen.getByText("456")).toHaveClass("diffOld");
  });
  it("displays calculated values diff", () => {
    const customPayload = {
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 3,
                  isPristine: false,
                  calculatedEiPerformance: 10,
                  paymentPercentage: 40,
                  holdbackAmountToDate: 123,
                  actualPerformanceMilestoneAmount: null,
                  operation: "UPDATE",
                  formChangeByPreviousFormChangeId: {
                    calculatedEiPerformance: 20,
                    paymentPercentage: 44,
                    holdbackAmountToDate: 321,
                    actualPerformanceMilestoneAmount: 789,
                  },
                },
              },
            ],
          },
          latestCommittedEmissionIntensityReportFormChange: {
            edges: [
              {
                node: {
                  isPristine: false,
                  operation: "UPDATE",
                  calculatedEiPerformance: 22,
                  paymentPercentage: 13,
                  holdbackAmountToDate: 741,
                  actualPerformanceMilestoneAmount: 357,
                },
              },
            ],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customPayload);
    componentTestingHelper.renderComponent();
    expect(
      screen.getByText(/ghg emission intensity performance/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/20\.00 %/i)).toBeInTheDocument(); //old calculatedEiPerformance
    expect(screen.getByText(/10\.00 %/i)).toBeInTheDocument(); //new calculatedEiPerformance
    expect(screen.getByText(/22\.00 %/i)).toBeInTheDocument(); //latest committed calculatedEiPerformance

    expect(
      screen.getByText(
        /payment percentage of performance milestone amount \(%\)/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/44\.00 %/i)).toBeInTheDocument(); //old paymentPercentage
    expect(screen.getByText(/40\.00 %/i)).toBeInTheDocument(); //new paymentPercentage
    expect(screen.getByText(/13\.00 %/i)).toBeInTheDocument(); //latest committed paymentPercentage

    expect(
      screen.getByText(/maximum performance milestone amount/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\$321\.00/i)).toBeInTheDocument(); //old holdbackAmountToDate
    expect(screen.getByText(/\$123\.00/i)).toBeInTheDocument(); //new holdbackAmountToDate
    expect(screen.getByText(/\$741\.00/i)).toBeInTheDocument(); //latest committed holdbackAmountToDate

    expect(
      screen.getByText(/actual performance milestone amount/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\$789\.00/i)).toBeInTheDocument(); //old actualPerformanceMilestoneAmount
    expect(screen.getByText(/\$357\.00/i)).toBeInTheDocument(); //latest.t committed actualPerformanceMilestoneAmount
  });
});
