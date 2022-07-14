import { act, screen, waitFor, within } from "@testing-library/react";
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
              asReportingRequirement: {
                hasExpenses: true,
              },
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 2,
              newFormData: {
                reportDueDate: "2022-10-28",
                projectId: 51,
                reportType: "Reporting Milestone",
                submittedDate: "2022-05-02",
                description: "i am the second description",
                reportingRequirementIndex: 2,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 2,
              asReportingRequirement: {
                hasExpenses: false,
                id: "mock-reporting-requirement-id",
              },
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
              id: `mock-payment-id`,
              rowId: 1,
              newFormData: {
                reportingRequirementId: 1,
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
          {
            node: {
              name: "Reporting Milestone",
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
    expect(validateFormWithErrors).toHaveBeenCalledTimes(5);
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
        formChangesIds: [1, 2, 1, 2, 1],
      },
    });
  });

  it("Only renders the payment form for milestones types with associated expenses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByText(/milestone description/i)).toHaveLength(2);
    expect(screen.getAllByText(/Certifier/i)).toHaveLength(2);
    expect(screen.getAllByText(/milestone gross payment amount/i)).toHaveLength(
      1
    );
  });

  it("Creates a form change when changing the milestone type from one with no payments, to one with payments", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getAllByLabelText(/milestone type/i)[1]);
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("General")
      );
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateReportingRequirementFormChangeMutation",
      {
        reportType: "Milestone",
        input: {
          id: expect.any(String),
          formChangePatch: {
            newFormData: {
              reportType: "General Milestone",
              reportDueDate: "2022-10-28",
              projectId: 51,
              submittedDate: "2022-05-02",
              description: "i am the second description",
              reportingRequirementIndex: 2,
            },
            changeStatus: "pending",
          },
        },
      }
    );

    act(() => {
      componentTestingHelper.environment.mock.resolveMostRecentOperation({
        data: {
          updateFormChange: {
            formChange: {
              id: "mock-project-milestone-report-form-3",
              asReportingRequirement: {
                reportDueDate: "2022-07-13T11:52:45.092269-07:00",
                submittedDate: "2022-07-13T11:52:45.092269-07:00",
                hasExpenses: true,
                id: "mock-reporting-requirement-id",
              },
            },
          },
        },
      });
    });
    componentTestingHelper.expectMutationToBeCalled(
      "createFormChangeMutation",
      {
        input: {
          projectRevisionId: 1234,
          formDataSchemaName: "cif",
          formDataTableName: "payment",
          jsonSchemaName: "payment",
          operation: "CREATE",
          newFormData: {
            reportingRequirementId: 2,
          },
        },
      }
    );
  });

  it("Discards a form change when changing the milestone type from one with payments, to one without payments", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getAllByLabelText(/milestone type/i)[0]);
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("Reporting")
      );
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateReportingRequirementFormChangeMutation",
      {
        reportType: "Milestone",
        input: {
          id: "mock-project-milestone-report-form-2",
          formChangePatch: {
            newFormData: {
              reportType: "Reporting Milestone",
              reportDueDate: "2022-01-01",
              projectId: 51,
              description: "i am the first description",
              reportingRequirementIndex: 1,
            },
            changeStatus: "pending",
          },
        },
      }
    );

    act(() => {
      componentTestingHelper.environment.mock.resolveMostRecentOperation({
        data: {
          updateFormChange: {
            formChange: {
              id: "mock-project-milestone-report-form-2",
              asReportingRequirement: {
                reportDueDate: "2022-07-13T11:52:45.092269-07:00",
                submittedDate: "2022-07-13T11:52:45.092269-07:00",
                hasExpenses: false,
                id: "mock-reporting-requirement-id",
              },
              paymentFormChange: {
                id: "mock-payment-id",
                rowId: 1,
                newFormData: { reportingRequirementId: 1 },
                operation: "CREATE",
                formChangeByPreviousFormChangeId: null,
                __typename: "FormChange",
              },
            },
          },
        },
      });
    });
    componentTestingHelper.expectMutationToBeCalled(
      "deleteFormChangeWithConnectionMutation",
      {
        input: {
          id: "mock-payment-id",
        },
        connections: expect.any(Array),
      }
    );
  });

  it("Sets operation to UPDATE when changing a milstone type from one without payments, to one with payments, when a payment form_change already exists with operation ARCHIVE", async () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),
          milestonePaymentFormChanges: {
            edges: [
              {
                node: {
                  id: `mock-payment-id`,
                  rowId: 1,
                  newFormData: {
                    reportingRequirementId: 1,
                  },
                  operation: "ARCHIVE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: null,
                },
              },
            ],
            __id: "client:mock:__connection_milestonePaymentFormChanges_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getAllByLabelText(/milestone type/i)[1]);
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("General")
      );
    });

    componentTestingHelper.expectMutationToBeCalled(
      "updateFormChangeMutation",
      {
        input: {
          id: "mock-payment-id",
          formChangePatch: {
            operation: "UPDATE",
          },
        },
      }
    );
  });
});
