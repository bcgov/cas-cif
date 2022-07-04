import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { ProjectMilestoneReportFormSummary_projectRevision$data } from "__generated__/ProjectMilestoneReportFormSummary_projectRevision.graphql";
import compiledProjectMilestoneReportFormSummaryQuery, {
  ProjectMilestoneReportFormSummaryQuery,
} from "__generated__/ProjectMilestoneReportFormSummaryQuery.graphql";
import ProjectMilestoneReportFormSummary from "components/Form/ProjectMilestoneReportFormSummary";

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
  ProjectRevision() {
    const result: Partial<ProjectMilestoneReportFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        summaryMilestoneReportingRequirementFormChanges: {
          edges: [
            {
              node: {
                id: "Test Reporting Requirement ID - 1",
                isPristine: false,
                newFormData: {
                  description: "charmander",
                  projectId: 1,
                  reportingRequirementIndex: 1,
                  reportType: "General",
                  reportDueDate: "2020-01-10T23:59:59.999-07:00",
                },
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    description: "bulbasaur",
                    projectId: 1,
                    reportingRequirementIndex: 1,
                    reportDueDate: "2020-01-01T13:59:59.999-07:00",
                    reportType: "Advanced",
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
                },
                operation: "ARCHIVE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    description: "Removed comment",
                    projectId: 1,
                    reportDueDate: "2020-01-05T23:59:59.999-07:00",
                    reportingRequirementIndex: 1,
                  },
                },
                formDataRecordId: 2,
              },
            },
          ],
        },
        summaryMilestoneFormChanges: {
          edges: [
            {
              node: {
                id: "Test Milestone ID - 1",
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
            {
              node: {
                id: "Test Milestone ID - 2",
                isPristine: false,
                newFormData: {
                  reportingRequirementId: 2,
                },
                operation: "ARCHIVE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    reportingRequirementId: 2,
                  },
                },
              },
            },
          ],
        },
        summaryMilestonePaymentFormChanges: {
          edges: [
            {
              node: {
                id: "Test Payment ID - 1",
                isPristine: false,
                operation: "UPDATE",
                newFormData: {
                  reportingRequirementId: 1,
                },
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    reportingRequirementId: 1,
                  },
                },
              },
            },
            {
              node: {
                id: "Test Payment ID - 2",
                isPristine: false,
                newFormData: {
                  reportingRequirementId: 2,
                },
                operation: "ARCHIVE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    reportingRequirementId: 2,
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
    expect(screen.getByText("Milestone Report Removed")).toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // description diff
    expect(screen.getByText("bulbasaur")).toBeInTheDocument();
    expect(screen.getByText("charmander")).toBeInTheDocument();

    // milestone type diff
    expect(screen.getByText("General")).toBeInTheDocument();
    expect(screen.getByText("Advanced")).toBeInTheDocument();

    // report due date diff
    expect(screen.getByText(/Jan[.]? 1, 2020/i)).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 10, 2020/i)).toBeInTheDocument();
  });
});
