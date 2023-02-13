import { screen } from "@testing-library/react";
import ProjectSummaryReportForm from "components/Form/ProjectSummaryReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import projectSummaryProdSchema from "../../../../../schema/data/prod/json_schema/project_summary_report.json";

const testQuery = graphql`
  query ProjectSummaryReportFormQuery @relay_test_operation {
    query {
      projectRevision(id: "test_id") {
        ...ProjectSummaryReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      projectSummaryFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-summary-report-form-${generateID()}`,
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
            },
          },
        ],
        __id: "client:mock:__connection_projectSummaryFormChanges_connection",
      },
    };
  },
  Form() {
    return {
      jsonSchema: projectSummaryProdSchema,
    };
  },
  Query() {
    return {
      // Todo
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectSummaryReportForm,
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

describe("The ProjectSummaryReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders a project summary", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByLabelText("Project Summary Report Payment")[0]
    ).toHaveValue("1234");
  });
});
