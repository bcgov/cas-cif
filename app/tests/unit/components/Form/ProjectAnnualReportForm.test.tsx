import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectAnnualReportForm from "components/Form/ProjectAnnualReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";
import reportingRequirementProdSchema from "../../../../../schema/data/prod/json_schema/reporting_requirement.json";
import { mocked } from "jest-mock";
import { useUpdateReportingRequirementFormChange } from "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange";

const testQuery = graphql`
  query ProjectAnnualReportFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectAnnualReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    const firstFormId = `mock-project-Annual-report-form-${generateID()}`;
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      upcomingAnnualReportFormChange: {
        id: firstFormId,
        asReportingRequirement: {
          reportDueDate: "2022-01-01T00:00:00-07",
          reportingRequirementIndex: 1,
        },
      },
      projectAnnualReportFormChanges: {
        edges: [
          {
            node: {
              id: firstFormId,
              rowId: 57,
              newFormData: {
                id: 1,
                reportDueDate: "2022-01-01T00:00:00-07",
                projectId: 51,
                reportType: "Annual",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formByJsonSchemaName: {
                jsonSchema: reportingRequirementProdSchema,
              },
            },
          },
          {
            node: {
              id: `mock-project-Annual-report-form-${generateID()}`,
              rowId: 58,
              newFormData: {
                id: 2,
                reportDueDate: "2022-10-28T00:00:00-07",
                comments: "some comments",
                projectId: 51,
                reportType: "Annual",
                submittedDate: "2022-05-02T00:00:00-07",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
              formByJsonSchemaName: {
                jsonSchema: reportingRequirementProdSchema,
              },
            },
          },
        ],
        __id: "client:mock:__connection_projectAnnualReportFormChanges_connection",
      },
      projectFormChange: { formDataRecordId: 63 },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

jest.mock(
  "mutations/ProjectReportingRequirement/updateReportingRequirementFormChange"
);
const updateFormChange = jest.fn();
let isUpdating = false;
mocked(useUpdateReportingRequirementFormChange).mockImplementation(() => [
  updateFormChange,
  isUpdating,
]);

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectAnnualReportForm,
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

describe("The ProjectAnnualReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders two Annual reports with remove buttons, the report due indicator, and the overall status badge", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.getByRole("heading", { name: /annual report 1/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /annual report 2/i })
    ).toBeInTheDocument();

    expect(screen.getAllByText("Remove")).toHaveLength(2);
    expect(screen.getAllByRole("group")[0]).toHaveTextContent(
      /Overdue by \d+ day\(s\)/
    );
    expect(screen.getAllByRole("status")[0]).toHaveTextContent("Late");
  });

  it("Calls the addAnnualReportToRevision mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const addButton = screen.getByText(/Add another annual report/i);
    addButton.click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        connections: expect.any(Array),
        projectRevisionId: 1234,
        newFormData: {
          projectId: 63,
          reportType: "Annual",
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Add another Annual report/i));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while attempting to add the report."
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
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "discardReportingRequirementFormChangeMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        id: "mock-project-Annual-report-form-1",
      },
      connections: expect.any(Array),
      reportType: "Annual",
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

  it("Validates all forms when the submit button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );

    screen.getByText(/Submit/i).click();
    // Once per form
    expect(validateFormWithErrors).toHaveBeenCalledTimes(2);
  });

  it("calls the correct mutation when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    screen.getByText(/submit/i).click();

    componentTestingHelper.expectMutationToBeCalled(
      "stageReportingRequirementFormChangeMutation",
      {
        input: {
          rowId: 58,
          formChangePatch: expect.any(Object),
        },
        reportType: "Annual",
      }
    );
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getByText(/some comments/)).toBeInTheDocument();

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
        formChangesIds: [57, 58],
      },
    });
  });
});
