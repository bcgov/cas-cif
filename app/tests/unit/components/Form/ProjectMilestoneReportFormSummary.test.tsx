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
                calculatedNetAmount: 111,
                calculatedGrossAmount: 999,
                calculatedHoldbackAmount: 888,
                adjustedNetAmount: 11,
                adjustedGrossAmount: 99,
                adjustedHoldbackAmount: 88,
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
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
                reportingRequirementIndex: 1,
                reportingRequirementId: 2,
              },
              operation: "ARCHIVE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  description: "Removed comment",
                  projectId: 1,
                  reportDueDate: "2020-01-05T23:59:59.999-07:00",
                  reportingRequirementIndex: 1,
                  reportingRequirementId: 2,
                },
              },
              formDataRecordId: 2,
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

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // changed fields
    expect(screen.getByText("Milestone Description")).toBeInTheDocument();
    expect(screen.getByText("Milestone Type")).toBeInTheDocument();

    // Archive milestone report
    expect(screen.getByText("Milestone Report")).toBeInTheDocument();
    const milestoneReport = document.querySelector("dd > em.diffOld");
    expect(milestoneReport.textContent).toBe("Milestone Report");
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

  const latestCommittedData = {
    latestCommittedMilestoneFormChanges: {
      edges: [
        {
          node: {
            newFormData: {
              totalEligibleExpenses: 1000,
              description: "charmander",
              projectId: 1,
              reportingRequirementIndex: 1,
              reportType: "General",
              reportDueDate: "2020-01-10T23:59:59.999-07:00",
              reportingRequirementId: 1,
              hasExpenses: true,
              calculatedGrossAmount: 567,
              calculatedNetAmount: 789,
              calculatedHoldbackAmount: 891,
              adjustedNetAmount: 89,
              adjustedGrossAmount: 67,
              adjustedHoldbackAmount: 91,
            },
          },
        },
      ],
    },
  };

  const mockQueryPayloadLatestCommitted = {
    ...mockQueryPayload,
    ProjectRevision() {
      const originalProjectRevision = mockQueryPayload.ProjectRevision();
      const modifiedProjectRevision = {
        ...originalProjectRevision,
        latestCommittedMilestoneFormChanges: {
          edges: [
            {
              node: {
                newFormData:
                  latestCommittedData.latestCommittedMilestoneFormChanges
                    .edges[0].node.newFormData,
              },
            },
          ],
        },
      };
      return modifiedProjectRevision;
    },
  };

  it("Displays diffs of the data fields that were updated and shows latest committed values", () => {
    componentTestingHelper.defaultQueryResolver =
      mockQueryPayloadLatestCommitted;
    componentTestingHelper.loadQuery(mockQueryPayloadLatestCommitted);
    componentTestingHelper.renderComponent();

    // calculated values
    expect(
      screen.getByText("Gross Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$567\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$999\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$789\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$888\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$891\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$111\.00/i)).toBeInTheDocument();

    // adjusted values
    expect(
      screen.getByText("Gross Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$99\.00/i)).toBeInTheDocument();

    expect(screen.getByText(/\$89\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Net Payment Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$11\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$67\.00/i)).toBeInTheDocument();
    expect(
      screen.getByText("Holdback Amount This Milestone (Adjusted)")
    ).toBeInTheDocument();
    expect(screen.getByText(/\$88\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$91\.00/i)).toBeInTheDocument();
  });
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
                formChangeByPreviousFormChangeId: {
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
                formDataRecordId: 1,
              },
            },
          ],
        },
      };
      return result;
    },
  };

  it("Displays diffs of the data fields that were updated and the old values", () => {
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
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByRole("tooltip", {
        name: "maximum-amount-this-milestone-tooltip",
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("tooltip", {
        name: "total-eligible-expenses-tooltip",
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("tooltip", {
        name: "gross-payment-amount-this-milestone-tooltip",
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("tooltip", {
        name: "net-payment-amount-this-milestone-tooltip",
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("tooltip", {
        name: "holdback-amount-this-milestone-tooltip",
      })
    ).toHaveLength(2);
  });
});
