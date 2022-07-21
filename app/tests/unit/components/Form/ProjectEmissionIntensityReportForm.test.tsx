import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectEmissionIntensityReportForm from "components/Form/ProjectEmissionIntensityReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectEmissionIntensityReportFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectEmissionIntensityReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    return {
      emissionIntensityReportingRequirementFormChange: {
        edges: [
          {
            node: {
              id: `mock-emission-intensity-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                reportDueDate: "2022-01-01",
                projectId: 51,
                reportType: "TEIMP",
                comments: "general comments",
                reportingRequirementIndex: 1,
              },
              operation: "CREATE",
              changeStatus: "pending",
              reportType: "TEIMP",
              formChangeByPreviousFormChangeId: null,
              formDataRecordId: 1,
            },
          },
        ],
        __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
      },
      emissionIntensityReportFormChange: {
        edges: [
          {
            node: {
              id: `mock-project-milestone-report-form-${generateID()}`,
              rowId: 1,
              newFormData: {
                measurementPeriodStartDate: "2022-01-02",
                measurementPeriodEndDate: "2023-01-02",
                emissionFunctionalUnit: "1",
                baselineEmissionIntensity: "1",
                targetEmissionIntensity: "1",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_emissionIntensityReportFormChange_connection",
      },
    };
  },
  Query() {
    return {
      allReportTypes: {
        edges: [
          {
            node: {
              name: "TEIMP",
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
  component: ProjectEmissionIntensityReportForm,
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

describe("the emission intensity report form component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("renders a create button that calls the addEmissionIntensityReportToRevision mutation, when there is no report on that project revision", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),

          emissionIntensityReportingRequirementFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
          },
          emissionIntensityReportFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportFormChange_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();
    expect(screen.getByText("Add TEIMP Agreement")).toBeInTheDocument();
    userEvent.click(screen.getByText("Add TEIMP Agreement"));
    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];
    expect(mutationUnderTest.fragment.node.name).toBe(
      "addEmissionIntensityReportToRevisionMutation"
    );
  });

  it("uses useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    const mockResolver = {
      ...defaultMockResolver,
      ProjectRevision(context, generateID) {
        return {
          ...defaultMockResolver.ProjectRevision(context, generateID),

          emissionIntensityReportingRequirementFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportingRequirementFormChange_connection",
          },
          emissionIntensityReportFormChange: {
            edges: [],
            __id: "client:mock:__connection_emissionIntensityReportFormChange_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();
    expect(screen.getByText("Add TEIMP Agreement")).toBeInTheDocument();
    userEvent.click(screen.getByText("Add TEIMP Agreement"));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });
    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while attempting to create the project emissions intensity report."
    );
  });

  it("validates all forms when the submit button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );
    userEvent.click(screen.getByText(/submit.*/i));
    expect(validateFormWithErrors).toHaveBeenCalledTimes(2);
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });

  it("reverts the form_change status to 'pending' when editing", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: {
          comments: "general comments edited",
          projectId: 51,
        },
      },
    });
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");

    userEvent.click(screen.getByText(/Undo Changes/i));

    // expect 4 operations update and undo for requirements and emision intensity report
    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(4);

    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[3];

    expect(mutationUnderTest.fragment.node.name).toBe(
      "undoFormChangesMutation"
    );
    expect(mutationUnderTest.request.variables).toMatchObject({
      input: {
        formChangesIds: [1, 1],
      },
    });
  });

  it("calls the updateformchange mutation when the user types in data", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    userEvent.click(screen.getByText(/submit.*/i));
    userEvent.type(screen.getAllByLabelText(/comments/i)[0], " edited");
    const mutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];
    expect(mutationUnderTest.fragment.node.name).toBe(
      "updateEmissionIntensityReportFormChangeMutation"
    );
  });
});
