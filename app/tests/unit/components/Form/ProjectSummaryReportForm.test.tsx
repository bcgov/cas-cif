import { act, screen } from "@testing-library/react";
import ProjectSummaryReportForm from "components/Form/ProjectSummaryReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import projectSummaryProdSchema from "../../../../../schema/data/prod/json_schema/project_summary_report.json";
import userEvent from "@testing-library/user-event";

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

  it("renders a create button that calls createProjectSummaryReportMutation when there is no project summary report", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),

          projectSummaryFormChanges: {
            edges: [],
          },
        };
      },
    };

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
    userEvent.click(screen.getByText(/create/i));
    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];
    expect(mutationUnderTest.fragment.node.name).toBe(
      "createProjectSummaryReportMutation"
    );
  });

  it("Renders the project summary report", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getByRole("heading", { name: /project summary report/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Report Due Date/i)).toHaveTextContent(
      /Feb[.]? 01, 2022/
    );
    expect(screen.getByLabelText(/Received Date/i)).toHaveTextContent(
      /Jan[.]? 01, 2022/
    );
    expect(screen.getByLabelText(/General Comments/i)).toHaveTextContent(
      /comments/
    );
    expect(screen.getByLabelText(/Notes for the payment/i)).toHaveTextContent(
      /payment notes/
    );
    expect(
      screen.getAllByLabelText("Project Summary Report Payment")[0]
    ).toHaveValue("1234");
    expect(
      screen.getByLabelText(/Date invoice sent to CSNR/i)
    ).toHaveTextContent(/Feb[.]? 02, 2022/);
  });

  it("calls useMutationWithErrorMessage and returns expected message when there is a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/submit project summary/i));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });
    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred when staging the form change."
    );
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));

    componentTestingHelper.expectMutationToBeCalled(
      "stageReportingRequirementFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: expect.any(Object),
        },
        reportType: "Project Summary Report",
      }
    );
  });

  it("calls the updateformchange mutation when the user types in data", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");
    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectSummaryReportFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: expect.any(Object),
        },
        reportType: "Project Summary Report",
      }
    );
  });
});
