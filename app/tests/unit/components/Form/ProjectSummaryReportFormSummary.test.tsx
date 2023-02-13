import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import ProjectSummaryReportFormSummary from "components/Form/ProjectSummaryReportFormSummary";
import projectSummaryProdSchema from "../../../../../schema/data/prod/json_schema/project_summary_report.json";
import compiledProjectSummaryReportFormSummaryQuery, {
  ProjectSummaryReportFormSummaryQuery,
} from "__generated__/ProjectSummaryReportFormSummaryQuery.graphql";

const testQuery = graphql`
  query ProjectSummaryReportFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectSummaryReportFormSummary_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Form() {
    return {
      jsonSchema: projectSummaryProdSchema,
    };
  },
  ProjectRevision() {
    const result = {
      isFirstRevision: false,
      summaryProjectSummaryFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-summary-report-form-summary-1`,
              rowId: 1,
              newFormData: {
                reportDueDate: "2022-02-01",
                submittedDate: "2022-01-01",
                comments: "comments",
                projectSummaryReportPayment: 1234,
                paymentNotes: "payment notes",
                dateSentToCsnr: "2022-02-02",
              },
              changeStatus: "pending",
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  reportDueDate: "2022-02-01",
                  submittedDate: "2022-01-01",
                  comments: "new comments",
                  projectSummaryReportPayment: 4321,
                  paymentNotes: "new payment notes",
                  dateSentToCsnr: "2022-02-02",
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
  new ComponentTestingHelper<ProjectSummaryReportFormSummaryQuery>({
    component: ProjectSummaryReportFormSummary,
    testQuery: testQuery,
    compiledQuery: compiledProjectSummaryReportFormSummaryQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The Project Summary Report Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });
});
