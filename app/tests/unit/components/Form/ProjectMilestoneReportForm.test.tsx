import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectMilestoneReportForm from "components/Form/ProjectMilestoneReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import milestoneProdSchema from "../../../../../schema/data/prod/json_schema/milestone.json";
import { useUpdateMilestone } from "mutations/MilestoneReport/updateMilestone";
import { mocked } from "jest-mock";

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
                substantialCompletionDate: "2021-12-02",
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
                calculatedGrossAmount: 1,
                calculatedNetAmount: 1,
                calculatedHoldbackAmount: 1,
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
                substantialCompletionDate: "2022-09-28",
                reportDueDate: "2022-10-28",
                projectId: 51,
                reportType: "Reporting Milestone",
                submittedDate: "2022-05-02",
                description: "i am the second description",
                reportingRequirementIndex: 2,
                hasExpenses: false,
                reportingRequirementId: 2,
                certifierProfessionalDesignation: "Professional Engineer",
                calculatedGrossAmount: 1,
                calculatedNetAmount: 1,
                calculatedHoldbackAmount: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 2,
              calculatedGrossAmountThisMilestone: 1,
              calculatedNetAmountThisMilestone: 1,
              calculatedHoldbackAmountThisMilestone: 1,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 3,
              newFormData: {
                substantialCompletionDate: "2022-10-28",
                reportDueDate: "2022-11-28",
                projectId: 51,
                reportType: "Advanced Milestone",
                submittedDate: "2022-05-02",
                description: "i am the third description",
                reportingRequirementIndex: 3,
                hasExpenses: true,
                reportingRequirementId: 2,
                certifierProfessionalDesignation: "Professional Engineer",
                calculatedGrossAmount: 1,
                calculatedNetAmount: 1,
                calculatedHoldbackAmount: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 2,
              calculatedGrossAmountThisMilestone: 1,
              calculatedNetAmountThisMilestone: 1,
              calculatedHoldbackAmountThisMilestone: 1,
            },
          },
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 4,
              newFormData: {
                substantialCompletionDate: "2022-10-28",
                reportDueDate: "2022-11-28",
                projectId: 51,
                reportType: "Interim Summary Report",
                submittedDate: "2022-05-02",
                description: "i am the third description",
                reportingRequirementIndex: 3,
                hasExpenses: true,
                reportingRequirementId: 2,
                certifierProfessionalDesignation: "Professional Engineer",
                calculatedGrossAmount: 1,
                calculatedNetAmount: 1,
                calculatedHoldbackAmount: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 2,
              calculatedGrossAmountThisMilestone: 1,
              calculatedNetAmountThisMilestone: 1,
              calculatedHoldbackAmountThisMilestone: 1,
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

jest.mock("mutations/MilestoneReport/updateMilestone");
const updateFormChange = jest.fn();
let isUpdating = false;
mocked(useUpdateMilestone).mockImplementation(() => [
  updateFormChange,
  isUpdating,
]);

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
    expect(
      screen.getAllByLabelText("Maximum Amount This Milestone")[0]
    ).toHaveValue("$200.00");
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

    expect(screen.getAllByText("Remove")).toHaveLength(4);
  });

  it("renders the tooltips for the mock form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByRole("tooltip", {
        name: "maximum-amount-this-milestone-tooltip",
        hidden: true,
      })
    ).toHaveLength(3);

    expect(
      screen.getAllByRole("tooltip", {
        name: "total-eligible-expenses-tooltip",
        hidden: true,
      })
    ).toHaveLength(2);

    expect(
      screen.getAllByRole("tooltip", {
        name: "gross-payment-amount-this-milestone-tooltip",
        hidden: true,
      })
    ).toHaveLength(3);

    expect(
      screen.getAllByRole("tooltip", {
        name: "net-payment-amount-this-milestone-tooltip",
        hidden: true,
      })
    ).toHaveLength(3);

    expect(
      screen.getAllByRole("tooltip", {
        name: "holdback-amount-this-milestone-tooltip",
        hidden: true,
      })
    ).toHaveLength(3);
  });

  it("Calls the createMilestoneMutation mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const addButton = screen.getByText(/Add another milestone report/i);
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
            reportingRequirementIndex: 4,
          },
          operation: "CREATE",
          projectRevisionId: 1234,
        },
      },
    });
  });

  it("Calls updateMilestoneFormChangeMutation when changing the milestone form", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    act(() => {
      userEvent.click(screen.getAllByLabelText(/milestone type/i)[1]);
    });
    userEvent.click(
      within(screen.getByRole("presentation")).getByText("General")
    );

    const updateMutationUnderTest =
      componentTestingHelper.environment.mock.getMostRecentOperation();

    expect(updateMutationUnderTest.fragment.node.name).toBe(
      "updateMilestoneFormChangeMutation"
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

  it("Calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await act(async () => {
      await userEvent.click(screen.getByText(/Add another milestone report/i));
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
      expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
        "An error occurred while adding the Milestone to the revision."
      );
    });
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
    expect(validateFormWithErrors).toHaveBeenCalledTimes(4);
  });

  it("Stages the form changes when the `submit` button is clicked", async () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    await userEvent.click(screen.getByText(/submit milestone reports/i));

    componentTestingHelper.expectMutationToBeCalled(
      "stageReportingRequirementFormChangeMutation",
      {
        input: {
          rowId: 1,
          formChangePatch: {
            newFormData: {
              reportDueDate: "2022-01-01",
              substantialCompletionDate: "2021-12-02",
              projectId: 51,
              reportType: "General Milestone",
              description: "i am the first description",
              reportingRequirementIndex: 1,
              hasExpenses: true,
              reportingRequirementId: 1,
              totalEligibleExpenses: 100,
              maximumAmount: 200,
              certifierProfessionalDesignation: "Professional Engineer",
              calculatedGrossAmount: 1,
              calculatedNetAmount: 1,
              calculatedHoldbackAmount: 1,
            },
          },
        },
        reportType: "Milestone",
      }
    );

    componentTestingHelper.expectMutationToBeCalled(
      "stageReportingRequirementFormChangeMutation",
      {
        input: {
          rowId: 2,
          formChangePatch: {
            newFormData: {
              reportDueDate: "2022-10-28",
              substantialCompletionDate: "2022-09-28",
              projectId: 51,
              reportType: "Reporting Milestone",
              submittedDate: "2022-05-02",
              description: "i am the second description",
              reportingRequirementIndex: 2,
              hasExpenses: false,
              reportingRequirementId: 2,
              certifierProfessionalDesignation: "Professional Engineer",
              calculatedGrossAmount: 1,
              calculatedNetAmount: 1,
              calculatedHoldbackAmount: 1,
            },
          },
        },
        reportType: "Milestone",
      }
    );
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
        formChangesIds: [1, 2, 3, 4],
      },
    });
  });

  it("Only renders the payment form for milestone types with associated expenses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getAllByText(/milestone description/i)).toHaveLength(4);
    expect(screen.getAllByText(/Certifier/i)).toHaveLength(4);
    expect(
      screen.getAllByText(/^gross payment amount this milestone/i)
    ).toHaveLength(6);
  });

  it("Only renders the totalEligibleExpenses and maximumAmount fields for milestone types with associated expenses", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByText(/milestone description/i)).toHaveLength(4);
    expect(screen.getAllByText(/Certifier/i)).toHaveLength(4);
    expect(screen.getAllByText(/maximum amount/i)).toHaveLength(3);
    expect(screen.getAllByText(/total eligible expenses/i)).toHaveLength(2);
  });

  it("Shows `This field cannot be calculated due to lack of information now.` message for calculated fields when submittedDate not provided", () => {
    const customMockResolver = {
      ...defaultMockResolver,
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
                    substantialCompletionDate: "2021-12-02",
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
            ],
            __id: "client:mock:__connection_milestoneReportingRequirementFormChanges_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customMockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByText(
        /This field cannot be calculated due to lack of information now./i
      )
    ).toHaveLength(3);
  });

  it("Shows `This field cannot be calculated due to lack of information now.` message for calculated fields when report type is General Milestone and totalEligibleExpenses not provided", () => {
    const customMockResolver = {
      ...defaultMockResolver,
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
                    substantialCompletionDate: "2021-12-02",
                    reportDueDate: "2022-01-01",
                    projectId: 51,
                    reportType: "General Milestone",
                    submittedDate: "2022-05-02",
                    description: "i am the first description",
                    reportingRequirementIndex: 1,
                    hasExpenses: true,
                    reportingRequirementId: 1,
                    maximumAmount: 200,
                    certifierProfessionalDesignation: "Professional Engineer",
                  },
                  operation: "CREATE",
                  changeStatus: "pending",
                  formChangeByPreviousFormChangeId: null,
                  formDataRecordId: 1,
                },
              },
            ],
            __id: "client:mock:__connection_milestoneReportingRequirementFormChanges_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(customMockResolver);
    componentTestingHelper.renderComponent();

    expect(
      screen.getAllByText(
        /This field cannot be calculated due to lack of information now./i
      )
    ).toHaveLength(3);
  });
});
