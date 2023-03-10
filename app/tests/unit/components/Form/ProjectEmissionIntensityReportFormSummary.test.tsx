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
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  reportingRequirementId: 1,
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

  it("only displays the fields that were updated on the summary", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getByText("squirtle")).toBeInTheDocument();
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

    expect(screen.getAllByText("ADDED")).toHaveLength(4);
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getAllByText("0.12345678")).toHaveLength(1);
    expect(screen.getByText("0.12345678")).toHaveClass(
      "diffReviewAndSubmitInformationNew"
    );
    expect(screen.getAllByText("123")).toHaveLength(1);
    expect(screen.getByText("123")).toHaveClass(
      "diffReviewAndSubmitInformationNew"
    );
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
                    teimpReporting: {
                      baselineEmissionIntensity: 0.87654321,
                      targetEmissionIntensity: 0,
                      postProjectEmissionIntensity: null,
                      totalLifetimeEmissionReduction: null,
                    },
                  },
                  operation: "UPDATE",
                  formChangeByPreviousFormChangeId: {
                    newFormData: {
                      baselineEmissionIntensity: 0,
                      targetEmissionIntensity: 0.12345678,
                      postProjectEmissionIntensity: 654,
                      totalLifetimeEmissionReduction: 456,
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

    expect(screen.getAllByText("REMOVED")).toHaveLength(2);
    expect(screen.getAllByText("0")).toHaveLength(2);
    expect(screen.getAllByText("0")[0]).toHaveClass(
      "diffReviewAndSubmitInformationOld"
    );
    expect(screen.getAllByText("0")[1]).toHaveClass(
      "diffReviewAndSubmitInformationNew"
    );
    expect(screen.getByText("0.87654321")).toHaveClass(
      "diffReviewAndSubmitInformationNew"
    );
    expect(screen.getByText("0.12345678")).toHaveClass(
      "diffReviewAndSubmitInformationOld"
    );
    expect(screen.getByText("654")).toHaveClass(
      "diffReviewAndSubmitInformationOld"
    );
    expect(screen.getByText("456")).toHaveClass(
      "diffReviewAndSubmitInformationOld"
    );
  });
});
