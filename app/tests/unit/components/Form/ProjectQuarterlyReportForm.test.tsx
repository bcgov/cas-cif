import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectQuarterlyReportForm from "components/Form/ProjectQuarterlyReportForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledFormIndexPageQuery, {
  FormIndexPageQuery,
} from "__generated__/FormIndexPageQuery.graphql";

const testQuery = graphql`
  query ProjectQuarterlyReportFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      projectRevision(id: "I can be anything") {
        ...ProjectQuarterlyReportForm_projectRevision
      }
    }
  }
`;

const defaultMockResolver = {
  ProjectRevision(context, generateID) {
    const firstFormId = `mock-project-quarterly-report-form-${generateID()}`;
    return {
      id: `mock-proj-rev-${generateID()}`,
      rowId: 1234,
      upcomingReportingRequirementFormChange: {
        id: firstFormId,
        reportingRequirement: {
          reportDueDate: "2022-01-01 12:01:00-07",
          reportingRequirementIndex: 1,
        },
      },
      projectQuarterlyReportFormChanges: {
        edges: [
          {
            node: {
              id: firstFormId,
              newFormData: {
                status: "on_track",
                reportDueDate: "2022-01-01 12:01:00-07",
                projectId: 51,
                reportType: "Quarterly",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
          {
            node: {
              id: `mock-project-quarterly-report-form-${generateID()}`,
              newFormData: {
                status: "on_track",
                reportDueDate: "2022-10-28 12:01:00-07",
                comments: "some comments",
                projectId: 51,
                reportType: "Quarterly",
                submittedDate: "2022-05-02 12:01:00-07",
              },
              operation: "CREATE",
              changeStatus: "pending",
              formChangeByPreviousFormChangeId: null,
            },
          },
        ],
        __id: "client:mock:__connection_projectQuarterlyReportFormChanges_connection",
      },
    };
  },
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper = new ComponentTestingHelper<FormIndexPageQuery>({
  component: ProjectQuarterlyReportForm,
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

describe("The ProjectQuarterlyReportForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders two quarterly reports with remove buttons, and the report due indicator", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByRole("textbox")).toHaveLength(2);

    expect(screen.getAllByText("Remove")).toHaveLength(2);
    expect(screen.getAllByRole("group")[0]).toHaveTextContent(
      /Overdue by \d+ day\(s\)/
    );
  });

  it("Calls the addQuarterlyReportToRevision mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const addButton = screen.getByText("Add another quarterly report");
    addButton.click();
    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        connections: expect.any(Array),
        projectRevisionId: 1234,
        newFormData: {
          projectId: 42,
          reportType: "Quarterly",
          status: "on_track",
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Add another quarterly report/i));
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
          id: "mock-project-quarterly-report-form-1",
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

  it("Validates all contact forms when the submit button is clicked", () => {
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

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    screen.getByText(/submit/i).click();
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
          projectQuarterlyReportFormChanges: {
            edges: [
              {
                node: {
                  id: `mock-project-quarterly-report-form-${generateID()}`,
                  newFormData: {
                    status: "on_track",
                    reportDueDate: "2022-01-01 12:00:00-07",
                    projectId: 51,
                    reportType: "Quarterly",
                  },
                  operation: "CREATE",
                  changeStatus: "staged",
                  formChangeByPreviousFormChangeId: null,
                },
              },
            ],
            __id: "client:mock:__connection_projectQuarterlyReportFormChanges_connection",
          },
        };
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    userEvent.type(
      screen.getByLabelText(/General Comments \(optional\)/),
      "comments"
    );

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: {
          comments: "comments",
          projectId: 51,
        },
      },
    });
  });
});
