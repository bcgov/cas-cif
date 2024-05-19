import { screen } from "@testing-library/react";
import ProjectEmissionIntensityReportFormSummary from "components/Form/ProjectEmissionIntensityReportFormSummary";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import emissionsIntensityProdSchema from "/schema/data/prod/json_schema/emission_intensity.json";

const testQuery = graphql`
  query ProjectEmissionIntensityReportFormSummaryQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectEmissionIntensityReportFormSummary_projectRevision
      }
      ...ProjectEmissionIntensityReportFormSummary_query
    }
  }
`;

const defaultMockResolver = {
  Form() {
    return {
      jsonSchema: emissionsIntensityProdSchema,
    };
  },
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
                baselineEmissionIntensity: 0.87654321,
              },
              operation: "UPDATE",
              formDataRecordId: 1,
            },
          },
        ],
      },
      latestCommittedEmissionIntensityReportFormChange: {
        edges: [
          {
            node: {
              newFormData: {
                comments: "squirtle",
                reportType: "TEIMP",
                projectId: 1,
                reportingRequirementIndex: 1,
                reportingRequirementId: 1,
                baselineEmissionIntensity: 0.985145,
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
    expect(screen.getByText("0.98514500")).toBeInTheDocument();
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
      Form() {
        return {
          jsonSchema: emissionsIntensityProdSchema,
        };
      },
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 2,
                  isPristine: false,
                  newFormData: {
                    baselineEmissionIntensity: 0,
                    targetEmissionIntensity: 0.12345678,
                    postProjectEmissionIntensity: 0,
                    totalLifetimeEmissionReduction: 123,
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
    expect(screen.getAllByText("0.00000000")).toHaveLength(2);
    expect(screen.getByText("0.12345678")).toHaveClass("diffNew");
    expect(screen.getByText("123.00000000")).toHaveClass("diffNew");
  });

  it("displays the correct data when we have zero values and decimal points on BEI/TEI/PEI and Total Lifetime Emission Reduction and updating an emission intensity report form", () => {
    const customPayload = {
      Form() {
        return {
          jsonSchema: emissionsIntensityProdSchema,
        };
      },
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 2,
                  isPristine: false,
                  newFormData: {
                    baselineEmissionIntensity: 0.87654321,
                    targetEmissionIntensity: 0,
                  },
                  operation: "UPDATE",
                },
              },
            ],
          },
          latestCommittedEmissionIntensityReportFormChange: {
            edges: [
              {
                node: {
                  newFormData: {
                    baselineEmissionIntensity: 0,
                    targetEmissionIntensity: 0.12345678,
                    postProjectEmissionIntensity: 654,
                    totalLifetimeEmissionReduction: 456,
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

    expect(screen.getAllByText("0.00000000")).toHaveLength(2);
    expect(screen.getAllByText("0.00000000")[0]).toHaveClass("diffOld");
    expect(screen.getAllByText("0.00000000")[1]).toHaveClass("diffNew");
    expect(screen.getByText("0.87654321")).toHaveClass("diffNew");
    expect(screen.getByText("0.12345678")).toHaveClass("diffOld");
    expect(screen.getByText("654.00000000")).toHaveClass("diffOld");
    expect(screen.getByText("456.00000000")).toHaveClass("diffOld");
  });

  it("displays calculated values diff", () => {
    const customPayload = {
      Form() {
        return {
          jsonSchema: emissionsIntensityProdSchema,
        };
      },
      ProjectRevision() {
        return {
          isFirstRevision: false,
          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 3,
                  isPristine: false,
                  calculatedEiPerformance: 10,
                  paymentPercentage: 40,
                  maximumPerformanceMilestoneAmount: 123,
                  actualPerformanceMilestoneAmount: null,
                  operation: "UPDATE",
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
                  calculatedEiPerformance: 20,
                  paymentPercentage: 44,
                  maximumPerformanceMilestoneAmount: 321,
                  actualPerformanceMilestoneAmount: 789,
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
    expect(screen.getByText(/20\.00 %/i)).toBeInTheDocument(); //latest committed calculatedEiPerformance
    expect(screen.getByText(/10\.00 %/i)).toBeInTheDocument(); //new calculatedEiPerformance

    expect(
      screen.getByText(
        /payment percentage of performance milestone amount \(%\)/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/44\.00 %/i)).toBeInTheDocument(); //latest committed paymentPercentage
    expect(screen.getByText(/40\.00 %/i)).toBeInTheDocument(); //new paymentPercentage

    expect(
      screen.getByText(/maximum performance milestone amount/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\$321\.00/i)).toBeInTheDocument(); //latest committed maximumPerformanceMilestoneAmount
    expect(screen.getByText(/\$123\.00/i)).toBeInTheDocument(); //new maximumPerformanceMilestoneAmount

    expect(
      screen.getByText(/actual performance milestone amount/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/\$789\.00/i)).toBeInTheDocument(); //latest committed actualPerformanceMilestoneAmount
  });

  it("renders the help tooltips", () => {
    const customPayload = {
      Form() {
        return {
          jsonSchema: emissionsIntensityProdSchema,
        };
      },
      ProjectRevision() {
        return {
          isFirstRevision: true,
          summaryEmissionIntensityReportingRequirementFormChange: {
            edges: [
              {
                node: {
                  id: "mock-emission-intensity-report-form-change-id",
                  rowId: 4,
                  isPristine: true,
                  calculatedEiPerformance: 10,
                  paymentPercentage: 40,
                  maximumPerformanceMilestoneAmount: 123,
                  actualPerformanceMilestoneAmount: null,
                  operation: "CREATE",
                },
              },
            ],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customPayload);
    componentTestingHelper.renderComponent();

    // Note the exclusion of the GHG Emission Intensity Performance (Adjusted) field here
    // This is captured in AdjustableCalculatedValueWidget.test.tsx

    expect(
      screen.getByRole("tooltip", {
        name: "ghg-emission-intensity-performance-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "payment-percentage-of-performance-milestone-amount-(%)-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "maximum-performance-milestone-amount-tooltip",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("tooltip", {
        name: "actual-performance-milestone-amount-tooltip",
      })
    ).toBeInTheDocument();
  });
});
