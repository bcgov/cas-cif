import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { ProjectQuarterlyReportFormSummary_projectRevision$data } from "__generated__/ProjectQuarterlyReportFormSummary_projectRevision.graphql";
import compiledProjectQuarterlyReportFormSummaryQuery, {
  ProjectQuarterlyReportFormSummaryQuery,
} from "__generated__/ProjectQuarterlyReportFormSummaryQuery.graphql";
import ProjectQuarterlyReportFormSummary from "components/Form/ProjectQuarterlyReportFormSummary";

const testQuery = graphql`
  query ProjectQuarterlyReportFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectQuarterlyReportFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision() {
    const result: Partial<ProjectQuarterlyReportFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        summaryProjectQuarterlyReportFormChanges: {
          edges: [
            {
              node: {
                id: "Test ID - 1",
                isPristine: false,
                newFormData: {
                  comments: "Updated Test comment",
                  projectId: 1,
                  reportDueDate: "Updated report due date",
                  reportingRequirementIndex: 1,
                },
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    comments: "Test comment",
                    projectId: 1,
                    reportDueDate: "Report due date",
                    reportingRequirementIndex: 1,
                  },
                },
              },
            },
            {
              node: {
                id: "Test ID - 2",
                isPristine: true,
                newFormData: {
                  comments: "Not updated comment",
                  projectId: 1,
                  reportDueDate: "Not updated report due date",
                  reportingRequirementIndex: 1,
                },
                operation: "UPDATE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    comments: "Not updated comment",
                    projectId: 1,
                    reportDueDate: "Not updated report due date",
                    reportingRequirementIndex: 1,
                  },
                },
              },
            },
            {
              node: {
                id: "Test ID - 3",
                isPristine: false,
                newFormData: {
                  comments: "Added comment",
                  projectId: 1,
                  reportDueDate: "Added report due date",
                  reportingRequirementIndex: 1,
                },
                operation: "CREATE",
                formChangeByPreviousFormChangeId: null,
              },
            },
            {
              node: {
                id: "Test ID - 4",
                isPristine: false,
                newFormData: {
                  comments: "Removed comment",
                  projectId: 1,
                  reportDueDate: "Removed report due date",
                  reportingRequirementIndex: 1,
                },
                operation: "ARCHIVE",
                formChangeByPreviousFormChangeId: {
                  newFormData: {
                    comments: "Removed comment",
                    projectId: 1,
                    reportDueDate: "Removed report due date",
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
  new ComponentTestingHelper<ProjectQuarterlyReportFormSummaryQuery>({
    component: ProjectQuarterlyReportFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectQuarterlyReportFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Quarterly Report Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // First Node
    expect(screen.getByText("Updated Test comment")).toBeInTheDocument();
    expect(screen.getByText("Updated report due date")).toBeInTheDocument();

    // Second Node
    expect(screen.queryByText("Not updated comment")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Not updated report due date")
    ).not.toBeInTheDocument();

    // Third Node
    expect(screen.getByText("Added comment")).toBeInTheDocument();
    expect(screen.getByText("Added report due date")).toBeInTheDocument();

    // Fourth Node
    expect(screen.getByText("Quarterly Report Removed")).toBeInTheDocument();
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Test comment")).toBeInTheDocument();
    expect(screen.getByText("Updated Test comment")).toBeInTheDocument();

    expect(screen.getByText("Report due date")).toBeInTheDocument();
    expect(screen.getByText("Updated report due date")).toBeInTheDocument();
  });
});
