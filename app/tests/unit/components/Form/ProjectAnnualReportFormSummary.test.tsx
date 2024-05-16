import { graphql } from "react-relay";
import { screen } from "@testing-library/react";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import { ProjectAnnualReportFormSummary_projectRevision$data } from "__generated__/ProjectAnnualReportFormSummary_projectRevision.graphql";
import compiledProjectAnnualReportFormSummaryQuery, {
  ProjectAnnualReportFormSummaryQuery,
} from "__generated__/ProjectAnnualReportFormSummaryQuery.graphql";
import ProjectAnnualReportFormSummary from "components/Form/ProjectAnnualReportFormSummary";
import reportingRequirementProdSchema from "../../../../../schema/data/prod/json_schema/reporting_requirement.json";

const testQuery = graphql`
  query ProjectAnnualReportFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectAnnualReportFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  ProjectRevision(context, generateID) {
    const result: Partial<ProjectAnnualReportFormSummary_projectRevision$data> =
      {
        isFirstRevision: false,
        summaryAnnualReportFormChanges: {
          edges: [
            {
              node: {
                rowId: 1,
                id: `mock-proj-rev-${generateID()}`,
                isPristine: true,
                newFormData: {
                  status: "on_track",
                  comments: "I am the updated comment on Annual Report #1",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate: "2022-06-18T23:59:59.999-07:00",
                  submittedDate: "2022-07-01T23:59:59.999-07:00",
                  reportingRequirementIndex: 1,
                },
                operation: "UPDATE",
                changeStatus: "committed",
                formByJsonSchemaName: {
                  jsonSchema: reportingRequirementProdSchema,
                },
              },
            },
            {
              node: {
                rowId: 2,
                id: `mock-proj-rev-${generateID()}`,
                isPristine: true,
                newFormData: {
                  status: "on_track",
                  comments: "I am an unchanged comment on Annual Report #2",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate:
                    "I am an unchanged due date on Annual Report #2",
                  submittedDate:
                    "I am an unchanged received date on Annual Report #2",
                  reportingRequirementIndex: 2,
                },
                operation: "UPDATE",
                changeStatus: "committed",
                formByJsonSchemaName: {
                  jsonSchema: reportingRequirementProdSchema,
                },
              },
            },
            {
              node: {
                rowId: 3,
                id: `mock-proj-rev-${generateID()}`,
                isPristine: true,
                newFormData: {
                  status: "on_track",
                  comments: "I am a new comment",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate: "2021-01-01T23:59:59.999-07:00",
                  submittedDate: "2022-01-01T23:59:59.999-07:00",
                  reportingRequirementIndex: 3,
                },
                operation: "UPDATE",
                changeStatus: "committed",
                formByJsonSchemaName: {
                  jsonSchema: reportingRequirementProdSchema,
                },
              },
            },
            {
              node: {
                rowId: 4,
                id: `mock-proj-rev-${generateID()}`,
                isPristine: false,
                newFormData: {
                  status: "on_track",
                  comments: "I have been deleted",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate: "2022-06-03T23:59:59.999-07:00",
                  submittedDate: "2022-06-24T23:59:59.999-07:00",
                  reportingRequirementIndex: 4,
                },
                operation: "ARCHIVE",
                changeStatus: "committed",
                formByJsonSchemaName: {
                  jsonSchema: reportingRequirementProdSchema,
                },
              },
            },
          ],
        },
        latestCommittedAnnualReportFormChanges: {
          edges: [
            {
              node: {
                newFormData: {
                  status: "on_track",
                  comments: "I am the old comment on Annual Report #1",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate: "2025-06-18T23:59:59.999-07:00",
                  submittedDate: "2025-07-01T23:59:59.999-07:00",
                  reportingRequirementIndex: 1,
                },
              },
            },
            {
              node: {
                newFormData: {
                  status: "on_track",
                  comments: "I am an unchanged comment on Annual Report #2",
                  projectId: 1,
                  reportType: "Annual",
                  reportDueDate:
                    "I am an unchanged due date on Annual Report #2",
                  submittedDate:
                    "I am an unchanged received date on Annual Report #2",
                  reportingRequirementIndex: 2,
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
  new ComponentTestingHelper<ProjectAnnualReportFormSummaryQuery>({
    component: ProjectAnnualReportFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectAnnualReportFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Annual Report Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("Only displays the data fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByText(/Report Due Date/i)).toHaveLength(2);
    expect(screen.getAllByText("Report Received Date (optional)")).toHaveLength(
      2
    );
    expect(screen.getAllByText("General Comments (optional)")).toHaveLength(2);
  });

  it("Displays diffs of the the data fields that were updated", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // First Node
    expect(
      screen.getByText("I am the old comment on Annual Report #1")
    ).toBeInTheDocument();
    expect(
      screen.getByText("I am the updated comment on Annual Report #1")
    ).toBeInTheDocument();
    // updated due date
    expect(screen.getByText(/Jun[.]? 18, 2022/)).toBeInTheDocument();
    expect(screen.getByText(/Jun[.]? 18, 2025/)).toBeInTheDocument();
    //updated received date
    expect(screen.getByText(/Jul[.]? 1, 2022/)).toBeInTheDocument();
    expect(screen.getByText(/Jul[.]? 1, 2025/)).toBeInTheDocument();

    // Second Node
    expect(
      screen.queryByText("I am an unchanged comment on Annual Report #2")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("I am an unchanged due date on Annual Report #2")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("I am an unchanged received date on Annual Report #2")
    ).not.toBeInTheDocument();

    // Third Node
    expect(screen.getByText("I am a new comment")).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2021/)).toBeInTheDocument();
    expect(screen.getByText(/Jan[.]? 1, 2022/)).toBeInTheDocument();

    // Fourth Node
    expect(screen.getByText("Annual Report")).toBeInTheDocument();
    const annualReportText = document.querySelector("dd > em.diffOld");
    expect(annualReportText.textContent).toBe("Annual Report");
  });
});
