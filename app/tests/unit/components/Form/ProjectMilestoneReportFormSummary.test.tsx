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
        summaryProjectMilestoneReportFormChanges: {
          edges: [
            {
              node: {
                id: "Test ID - 1",
                isPristine: false,
                newFormData: {
                  projectId: 1,
                  reportingRequirementIndex: 1,
                  profesionalDesignation: "Professional Engineer",
                  comments: "Changing milestone type.",
                  milestoneType: "General",
                },
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    projectId: 1,
                    reportingRequirementIndex: 1,
                    reportDueDate: "2020-01-02T23:59:59.999-07:00",
                  },
                },
              },
            },
            {
              node: {
                id: "Test ID - 2",
                isPristine: false,
                newFormData: {
                  comments: "Removed comment",
                  projectId: 1,
                  reportDueDate: "2020-01-05T23:59:59.999-07:00",
                  reportingRequirementIndex: 1,
                },
                operation: "ARCHIVE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    comments: "Removed comment",
                    projectId: 1,
                    reportDueDate: "2020-01-05T23:59:59.999-07:00",
                    reportingRequirementIndex: 1,
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
    expect(screen.getByText("Changing milestone type.")).toBeInTheDocument();
    expect(screen.getByText(/General/)).toBeInTheDocument();

    // unchanged fields
    expect(screen.queryByText(/Jan[.]? 3, 2020/)).not.toBeInTheDocument();

    // Archive milestone report
    expect(screen.getByText("Milestone Report Removed")).toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Professional Engineer")).toBeInTheDocument();
    expect(screen.getByText("General")).toBeInTheDocument();
  });
});
