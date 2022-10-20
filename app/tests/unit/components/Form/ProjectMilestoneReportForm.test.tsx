import { act, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectMilestoneReportForm from "components/Form/ProjectMilestoneReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import milestoneProdSchema from "../../../../../schema/data/prod/json_schema/milestone.json";

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
      upcomingMilestoneReportFormChange: {
        id: "mock-id",
        asReportingRequirement: {
          reportDueDate: "2022-01-01T00:00:00-07",
          reportingRequirementIndex: 1,
        },
      },
      milestoneFormChanges: {
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
                hasExpenses: true,
                reportingRequirementId: 1,
                totalEligibleExpenses: 100,
                maximumAmount: 200,
                certifierProfessionalDesignation: "Professional Engineer",
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
                reportType: "Reporting Milestone",
                submittedDate: "2022-05-02",
                description: "i am the second description",
                reportingRequirementIndex: 2,
                hasExpenses: false,
                reportingRequirementId: 2,
                certifierProfessionalDesignation: "Professional Engineer",
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
    };
  },
  Form() {
    return {
      jsonSchema: milestoneProdSchema,
    };
  },
  Query() {
    return {
      allReportTypes: {
        edges: [
          {
            node: {
              name: "General Milestone",
              hasExpenses: true,
            },
          },
          {
            node: {
              name: "Advanced Milestone",
              hasExpenses: true,
            },
          },
          {
            node: {
              name: "Reporting Milestone",
              hasExpenses: false,
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

  it("Renders a milestone with the correct budget data", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByLabelText("Total Eligible Expenses")[0]).toHaveValue(
      "$100.00"
    );
    expect(screen.getAllByLabelText("Maximum Amount")[0]).toHaveValue(
      "$200.00"
    );
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

  it("Calls the createMilestoneMutation mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const addButton = screen.getByText("Add another milestone report");
    addButton.click();

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();

    expect(mutationUnderTest.request.node.operation.name).toEqual(
      "createMilestoneMutation"
    );

    expect(mutationUnderTest.request).toMatchObject({
      variables: {
        input: {
          formDataSchemaName: "cif",
          formDataTableName: "reporting_requirement",
          jsonSchemaName: "milestone",
          newFormData: {
            reportingRequirementIndex: 3,
          },
          operation: "CREATE",
          projectRevisionId: 1234,
        },
      },
    });
  });

  it("Calls updateReportingRequirementFormChangeMutation when changing the milestone form", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getAllByLabelText(/milestone type/i)[1]);
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("General")
      );
    });

    const updateMutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();

    expect(updateMutationUnderTest.fragment.node.name).toBe(
      "updateReportingRequirementFormChangeMutation"
    );
    expect(updateMutationUnderTest.request.variables).toMatchObject({
      reportType: "Milestone",
      input: {
        rowId: 2,
        formChangePatch: {
          newFormData: {
            reportType: "General Milestone",
            reportDueDate: "2022-10-28",
            projectId: 51,
            submittedDate: "2022-05-02",
            description: "i am the second description",
            reportingRequirementIndex: 2,
          },
        },
      },
    });
  });

  it("Calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
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

  it("Calls discardReportingRequirementFormChangeMutation when the remove button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();
    expect(mutationUnderTest.fragment.node.name).toBe(
      "discardReportingRequirementFormChangeMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      connections: expect.any(Array),
      input: {
        id: "mock-project-milestone-report-form-2",
      },
      reportType: "Milestone",
    });
  });

  it("Calls useMutationWithErrorMessage and returns expected message when the remove button is clicked", () => {
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
    expect(validateFormWithErrors).toHaveBeenCalledTimes(2);
  });

  it("Stages the form changes when the `submit` button is clicked", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await userEvent.click(screen.getByText(/submit milestone reports/i));
    expect(true).toBe(true);

    const firstMutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(firstMutationUnderTest.fragment.node.name).toBe(
      "stageReportingRequirementFormChangeMutation"
    );
    expect(firstMutationUnderTest.request.variables).toMatchObject({
      input: {
        rowId: 1,
        formChangePatch: {
          newFormData: {
            reportDueDate: "2022-01-01",
            projectId: 51,
            reportType: "General Milestone",
            description: "i am the first description",
            reportingRequirementIndex: 1,
          },
        },
      },
      reportType: "Milestone",
    });

    const secondMutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();

    expect(secondMutationUnderTest.fragment.node.name).toBe(
      "stageReportingRequirementFormChangeMutation"
    );
    expect(secondMutationUnderTest.request.variables).toMatchObject({
      input: {
        rowId: 2,
        formChangePatch: {
          newFormData: {
            reportDueDate: "2022-10-28",
            projectId: 51,
            reportType: "Reporting Milestone",
            submittedDate: "2022-05-02",
            description: "i am the second description",
            reportingRequirementIndex: 2,
          },
        },
      },
      reportType: "Milestone",
    });
  });

  it("Calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/i am the first description/)).toBeInTheDocument();

    userEvent.click(screen.getByText(/Undo Changes/i));

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(2);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();

    expect(mutationUnderTest.fragment.node.name).toBe(
      "undoFormChangesMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangesIds: [1, 2],
      },
    });
  });

  it("Only renders the payment form for milestone types with associated expenses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getAllByText(/milestone description/i)).toHaveLength(2);
    expect(screen.getAllByText(/Certifier/i)).toHaveLength(2);
    expect(
      screen.getAllByText(/^milestone gross payment amount/i)
    ).toHaveLength(1);
  });

  it("Only renders the totalEligibleExpenses and maximumAmount fields for milestone types with associated expenses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByText(/milestone description/i)).toHaveLength(2);
    expect(screen.getAllByText(/Certifier/i)).toHaveLength(2);
    expect(screen.getAllByText(/maximum amount/i)).toHaveLength(1);
    expect(screen.getAllByText(/total eligible expenses/i)).toHaveLength(1);
  });
});
