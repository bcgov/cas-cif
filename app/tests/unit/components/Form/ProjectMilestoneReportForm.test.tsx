import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectMilestoneReportForm from "components/Form/ProjectMilestoneReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectMilestoneReportFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectMilestoneReportForm_projectRevision
      }
      ...ProjectMilestoneReportForm_query
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      projectMilestoneReportFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              newFormData: {
                reportDueDate: "2022-01-01",
                projectId: 51,
                reportType: "General Milestone",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              newFormData: {
                reportDueDate: "2022-10-28",
                comments: "some comments",
                projectId: 51,
                reportType: "Advanced Milestone",
                submittedDate: "2022-05-02",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_projectMilestoneReportFormChanges_connection",
      },
    };
  },
  Query() {
    return {
      allReportTypes: {
        edges: [
          {
            node: {
              name: "General Milestone",
            },
          },
        ],
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectMilestoneReportForm,
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

describe("The ProjectMilestoneReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders two milestone reports with remove buttons", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Milestone 1")).toBeInTheDocument();
    expect(screen.getByText("Milestone 2")).toBeInTheDocument();

    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("Calls the addMilestoneReportToRevision mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const addButton = screen.getByText("Add another milestone report");
    addButton.click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        connections: expect.any(Array),
        projectRevisionId: 1234,
        newFormData: {
          projectId: 42,
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Add another milestone report/i));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while attempting to add the report."
    );
  });

  it("Calls the updateFormChange mutation when the remove button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        input: {
          id: "mock-project-milestone-report-form-2",
        },
        connections: expect.any(Array),
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the remove button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred when deleting."
    );
  });

  it("Validates all milestone forms when the submit button is clicked", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );
    // resolve the update operations, else 'isUpdating' will disable the submit button
    componentTestingHelper.environment.mock.resolveMostRecentOperation({
      data: { variables: { input: "asdf" } },
    });
    componentTestingHelper.environment.mock.resolveMostRecentOperation({
      data: { variables: { input: "asdf" } },
    });
    userEvent.click(screen.getByText(/submit.*/i));

    // Once per form
    expect(validateFormWithErrors).toHaveBeenCalledTimes(2);
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    // resolve the update operations, else 'isUpdating' will disable the submit button
    componentTestingHelper.environment.mock.resolveMostRecentOperation({
      data: { variables: { input: "asdf" } },
    });
    componentTestingHelper.environment.mock.resolveMostRecentOperation({
      data: { variables: { input: "asdf" } },
    });
    userEvent.click(screen.getByText(/submit milestone reports/i));

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });

  it("reverts the form_change status to 'pending' when editing", async () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          projectMilestoneReportFormChanges: {
            edges: [
              {
                node: {
                  id: `mock-project-milestone-report-form-${generateID()}`,
                  newFormData: {
                    reportDueDate: "2022-01-01",
                    projectId: 51,
                    reportType: "Milestone",
                  },
                  operation: "CREATE",
                  changeStatus: "staged",
                  formChangeByPreviousFormChangeId: null,
                },
              },
            ],
            __id: "client:mock:__connection_projectMilestoneReportFormChanges_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    userEvent.type(screen.getByLabelText(/description/i), "desc");

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: {
          description: "desc",
          projectId: 51,
        },
      },
    });
  });
});
