import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectMilestoneReportFormSummaryQuery, {
  ProjectMilestoneReportFormSummaryQuery,
} from "__generated__/ProjectMilestoneReportFormSummaryQuery.graphql";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";
import milestoneProdSchema from "../../../../../schema/data/prod/json_schema/milestone.json";

const testQuery = graphql`
  query ProjectMilestoneReportFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectMilestoneReportFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Form() {
    return {
      jsonSchema: milestoneProdSchema,
    };
  },
  ProjectRevision() {
    const result = {
      isFirstRevision: false,
      summaryMilestoneFormChanges: {
        edges: [
          {
            node: {
              id: "Test Reporting Requirement ID - 1",
              isPristine: false,
              newFormData: {
                totalEligibleExpenses: 1000,
                description: "charmander",
                projectId: 1,
                reportingRequirementIndex: 1,
                reportType: "General",
                reportDueDate: "2020-01-10T23:59:59.999-07:00",
                reportingRequirementId: 1,
                hasExpenses: true,
                maximumAmount: 123,
                calculatedNetAmount: 111,
                calculatedGrossAmount: 999,
                calculatedHoldbackAmount: 888,
                adjustedNetAmount: 11,
                adjustedGrossAmount: 99,
                adjustedHoldbackAmount: 88,
              },
              operation: "UPDATE",
              formDataRecordId: 1,
            },
          },
          {
            node: {
              id: "Test Reporting Requirement ID - 2",
              isPristine: false,
              newFormData: {
                description: "Removed comment",
                projectId: 1,
                reportDueDate: "2020-01-07T23:59:59.999-07:00",
                reportingRequirementIndex: 2,
                reportingRequirementId: 2,
              },
              operation: "ARCHIVE",
              formDataRecordId: 2,
            },
          },
        ],
      },
      latestCommittedMilestoneFormChanges: {
        edges: [
          {
            node: {
              newFormData: {
                description: "bulbasaur",
                projectId: 1,
                reportingRequirementIndex: 1,
                reportDueDate: "2020-01-01T13:59:59.999-07:00",
                reportType: "Advanced",
                reportingRequirementId: 1,
                hasExpenses: true,
              },
            },
          },
          {
            node: {
              newFormData: {
                description: "Removed comment",
                projectId: 1,
                reportDueDate: "2020-01-05T23:59:59.999-07:00",
                reportingRequirementIndex: 2,
                reportingRequirementId: 2,
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
  new ComponentTestingHelper<ProjectMilestoneReportFormSummaryQuery>({
    component: ProjectMilestoneReportFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectMilestoneReportFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Milestone Report Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // changed fields
    expect(screen.getByText(/Milestone Description/i)).toBeInTheDocument();
    expect(screen.getByText("Milestone Type")).toBeInTheDocument();

    // Archive milestone report
    expect(screen.getByText("Milestone Report")).toBeInTheDocument();
    const milestoneReport = document.querySelector("dd > em.diffOld");
    expect(milestoneReport.textContent).toBe("Milestone Report");
  });

  it("Displays calculated and adjusted values and labels for calculated fields", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // Gross Payment Amount
    expect(
      screen.getByText("Gross Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText("$999.00")).toBeInTheDocument();
    expect(
      screen.getByText(/gross payment amount this milestone \(adjusted\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("$99.00")).toBeInTheDocument();

    // Net Payment Amount
    expect(
      screen.getByText("Net Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText("$111.00")).toBeInTheDocument();
    expect(
      screen.getByText(/net payment amount this milestone \(adjusted\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("$11.00")).toBeInTheDocument();

    // Holdback Amount
    expect(
      screen.getByText("Holdback Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText("$888.00")).toBeInTheDocument();
    expect(
      screen.getByText(/holdback amount this milestone \(adjusted\)/i)
    ).toBeInTheDocument();
    expect(screen.getByText("$88.00")).toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // description diff
    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("charmander")).toBeInTheDocument();

    // milestone diff
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();

    // report due date diff
    expect(screen.getByText(/Jan[.]? 1, 2020/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 10, 2020/i)).toBeInTheDocument();

    // total eligible expenses
    expect(
      screen.getByText("Total Eligible Expenses (optional)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$1,000\.00/i)).toBeInTheDocument();

    // calculated values
    expect(
      screen.getByText("Gross Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$999\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$888\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$111\.00/i)).toBeInTheDocument();

    // adjusted values
    expect(
      screen.getByText("Gross Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$99\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$11\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$88\.00/i)).toBeInTheDocument();
  });

  it("Displays diffs of the data fields that were updated and the old values", () => {
    const mockQueryPayloadWithDiffs = {
      Form() {
        return {
          jsonSchema: milestoneProdSchema,
        };
      },
      ProjectRevision() {
        const result = {
          isFirstRevision: false,
          summaryMilestoneFormChanges: {
            edges: [
              {
                node: {
                  id: "Test Reporting Requirement ID - 1",
                  isPristine: false,
                  newFormData: {
                    totalEligibleExpenses: 1000,
                    description: "charmander",
                    projectId: 1,
                    reportingRequirementIndex: 1,
                    reportType: "General",
                    reportDueDate: "2020-01-10T23:59:59.999-07:00",
                    reportingRequirementId: 1,
                    hasExpenses: true,
                    calculatedNetAmount: 221,
                    calculatedGrossAmount: 222,
                    calculatedHoldbackAmount: 223,
                    adjustedNetAmount: 21,
                    adjustedGrossAmount: 22,
                    adjustedHoldbackAmount: 23,
                  },
                  operation: "UPDATE",
                  formDataRecordId: 1,
                },
              },
            ],
          },
          latestCommittedMilestoneFormChanges: {
            edges: [
              {
                node: {
                  newFormData: {
                    description: "bulbasaur",
                    projectId: 1,
                    reportingRequirementIndex: 1,
                    reportDueDate: "2020-01-01T13:59:59.999-07:00",
                    reportType: "Advanced",
                    reportingRequirementId: 1,
                    hasExpenses: true,
                    calculatedNetAmount: 111,
                    calculatedGrossAmount: 112,
                    calculatedHoldbackAmount: 113,
                    adjustedNetAmount: 11,
                    adjustedGrossAmount: 12,
                    adjustedHoldbackAmount: 13,
                  },
                },
              },
            ],
          },
        };
        return result;
      },
    };
    componentTestingHelper.defaultQueryResolver = mockQueryPayloadWithDiffs;
    componentTestingHelper.loadQuery(mockQueryPayloadWithDiffs);
    componentTestingHelper.renderComponent();

    // calculated values
    expect(
      screen.getByText("Gross Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$222\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$112\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$221\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$111\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$223\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$113\.00/i)).toBeInTheDocument();

    // adjusted values
    expect(
      screen.getByText("Gross Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$22\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$12\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$23\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$13\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$21\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$11\.00/i)).toBeInTheDocument();
  });

  it("renders the tooltips for the mock summary", () => {
    const mockTooltipPayload = {
      Form() {
        return {
          jsonSchema: milestoneProdSchema,
        };
      },
      ProjectRevision() {
        const result = {
          isFirstRevision: true,
          summaryMilestoneFormChanges: {
            edges: [
              {
                node: {
                  id: "Tooltip Test 1",
                  isPristine: null,
                  newFormData: {
                    calculatedGrossAmount: 123,
                    calculatedHoldbackAmount: 456,
                    calculatedNetAmount: 789,
                    certifierProfessionalDesignation: "Professional Engineer",
                    hasExpenses: true,
                    maximumAmount: 23,
                    reportType: "General Milestone",
                    totalEligibleExpenses: 1000,
                    adjustedGrossAmount: 1000,
                    reportingRequirementIndex: 1,
                  },
                  operation: "CREATE",
                },
              },
            ],
          },
        };
        return result;
      },
    };
    componentTestingHelper.loadQuery(mockTooltipPayload);
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByRole("tooltip", {
        name: "maximum-amount-this-milestone-tooltip",
      })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("tooltip", {
        name: "total-eligible-expenses-tooltip",
      })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("tooltip", {
        name: "gross-payment-amount-this-milestone-tooltip",
      })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("tooltip", {
        name: "net-payment-amount-this-milestone-tooltip",
      })
    ).toHaveLength(1);

    expect(
      screen.getAllByRole("tooltip", {
        name: "holdback-amount-this-milestone-tooltip",
      })
    ).toHaveLength(1);
  });
});
