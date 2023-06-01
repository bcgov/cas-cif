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
              calculatedNetAmountThisMilestone: 100,
              calculatedGrossAmountThisMilestone: 900,
              calculatedHoldbackAmountThisMilestone: 800,
              newFormData: {
                totalEligibleExpenses: 1000,
                description: "charmander",
                projectId: 1,
                reportingRequirementIndex: 1,
                reportType: "General",
                reportDueDate: "2020-01-10T23:59:59.999-07:00",
                reportingRequirementId: 1,
                hasExpenses: true,
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

    // calculated values
    expect(screen.getByText(/\$1,000\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$100\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/\$800\.00/i)).toBeInTheDocument();
  });
});
