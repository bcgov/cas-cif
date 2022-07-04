import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectMilestoneReportFormGroup from "components/Form/ProjectMilestoneReportFormGroup";
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
        ...ProjectMilestoneReportFormGroup_projectRevision
      }
      ...ProjectMilestoneReportFormGroup_query
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      upcomingMilestoneReportFormChange: {
        id: "mock-id",
        asReportingRequirement: {
          reportDueDate: "2022-01-01T00:00:00-07",
          reportingRequirementIndex: 1,
        },
      },
      milestoneReportingRequirementFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                reportDueDate: "2022-01-01",
                projectId: 51,
                reportType: "General Milestone",
                description: "i am the first description",
                reportingRequirementIndex: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 1,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 2,
              newFormData: {
                reportDueDate: "2022-10-28",
                projectId: 51,
                reportType: "Advanced Milestone",
                submittedDate: "2022-05-02",
                description: "i am the second description",
                reportingRequirementIndex: 2,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 2,
            },
          },
        ],
        __id: "client:mock:__connection_milestoneReportingRequirementFormChanges_connection",
      },
      milestoneFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                reportingRequirementId: 1,
                certifierProfessionalDesignation: "Professional Engineer",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 2,
              newFormData: {
                reportingRequirementId: 2,
                certifierProfessionalDesignation: "Professional Engineer",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_milestoneFormChanges_connection",
      },
      milestonePaymentFormChanges: {
        edges: [
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                reportingRequirementId: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 2,
              newFormData: {
                reportingRequirementId: 2,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_milestonePaymentFormChanges_connection",
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
          {
            node: {
              name: "Advanced Milestone",
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
  component: ProjectMilestoneReportFormGroup,
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

  it("Renders two milestone reports with remove buttons, the report due indicator, and the overall status badge", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText("Milestone 1")).toBeInTheDocument();
    expect(screen.getByText("Milestone 2")).toBeInTheDocument();

    expect(screen.getAllByRole("group")[0]).toHaveTextContent(
      /Overdue by \d+ day\(s\)/
    );
    // select the overall status badge
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Late");

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
        input: {
          reportingRequirementIndex: 3,
          revisionId: 1234,
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
      "An error occurred while adding the Milestone to the revision."
    );
  });

  it("Calls discardMilestoneFormChangeMutation when the remove button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "discardMilestoneFormChangeMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      connections: expect.any(Array),
      input: {
        reportingRequirementIndex: 1,
        revisionId: 1234,
      },
      reportType: "Milestone",
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

    userEvent.click(screen.getByText(/submit.*/i));

    // Once per form
    expect(validateFormWithErrors).toHaveBeenCalledTimes(4);
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/submit milestone reports/i));

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });

  it("reverts the form_change status to 'pending' when editing", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.type(screen.getAllByLabelText(/description/i)[0], " edited");

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: {
          description: "i am the first description edited",
          projectId: 51,
        },
      },
    });
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/i am the first description/)).toBeInTheDocument();

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "undoFormChangesMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangesIds: [1, 2],
      },
    });
  });
});
