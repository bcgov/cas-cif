import { screen } from "@testing-library/react";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import ProjectSummaryReportFormSummary from "components/Form/ProjectSummaryReportFormSummary";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import projectSummaryProdSchema from "../../../../../schema/data/prod/json_schema/project_summary_report.json";

const testQuery = graphql`
  query ProjectSummaryReportFormSummaryQuery @relay_test_operation {
    query {
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectSummaryReportFormSummary_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision() {
    return {
      id: "mock-id-1",
      isFirstRevision: false,
      summaryProjectSummaryFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-summary-report-form-summary-1`,
              newFormData: {
                comments: "old",
              },
              operation: "UPDATE",
              formChangeByPreviousFormChangeId: {
                newFormData: {
                  comments: "new",
                },
              },
            },
          },
        ],
      },
    };
  },
  Form() {
    return {
      jsonSchema: projectSummaryProdSchema,
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectSummaryReportFormSummary,
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

describe("The Project Summary Report Form Summary", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    componentTestingHelper.reinit();
  });

  it("only displays the fields that have changed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    // only the changed field is visible
    expect(screen.getByText(/old/i)).toBeInTheDocument();
    expect(screen.queryByText(/Report Due Date/i)).toBeNull();
  });

  it("displays not updated when there are no form updates", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision() {
        return {
          ...defaultMockResolver.ProjectRevision(),
          summaryProjectSummaryFormChanges: {
            edges: [],
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getByText("Project Summary Report not updated")
    ).toBeInTheDocument();
  });
});
