import {
  act,
  fireEvent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ValidatingFormProps } from "components/Form/Interfaces/FormValidationTypes";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectManagerFormGroupQuery, {
  ProjectManagerFormGroupQuery,
} from "__generated__/ProjectManagerFormGroupQuery.graphql";

const testQuery = graphql`
  query ProjectManagerFormGroupQuery($projectRevision: ID!)
  @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectManagerFormGroup_query
      projectRevision(id: $projectRevision) {
        ...ProjectManagerFormGroup_projectRevision
      }
    }
  }
`;

const mockQueryPayload = {
  Query() {
    return {
      projectRevision: {
        id: "Test Revision ID",
        rowId: 1,
        managerFormChanges: {
          edges: [
            {
              node: {
                projectManagerLabel: {
                  id: "Test Label 1 ID",
                  rowId: 1,
                  label: "Test Label 1",
                },
                formChange: null,
              },
            },
            {
              node: {
                projectManagerLabel: {
                  id: "Test Label 2 ID",
                  rowId: 2,
                  label: "Test Label 2",
                },
                formChange: {
                  id: "Change 2 ID",
                  rowId: 9,
                  operation: "CREATE",
                  changeStatus: "pending",
                  newFormData: {
                    cifUserId: 2,
                    projectId: 1,
                    projectManagerLabelId: 2,
                  },
                },
              },
            },
            {
              node: {
                projectManagerLabel: {
                  id: "Test Label 3 ID",
                  rowId: 3,
                  label: "Test Label 3",
                },
                formChange: {
                  id: "Change 3 ID",
                  rowId: 10,
                  operation: "UPDATE",
                  changeStatus: "pending",
                  newFormData: {
                    cifUserId: 2,
                    projectId: 1,
                    projectManagerLabelId: 3,
                  },
                },
              },
            },
            {
              node: {
                projectManagerLabel: {
                  id: "Test Label 4 ID",
                  rowId: 4,
                  label: "Test Label 4",
                },
                formChange: {
                  id: "Change 4 ID",
                  rowId: 11,
                  operation: "ARCHIVE",
                  changeStatus: "pending",
                  newFormData: {
                    cifUserId: 2,
                    projectId: 1,
                    projectManagerLabelId: 4,
                  },
                },
              },
            },
          ],
        },
        projectFormChange: {
          formDataRecordId: 1,
        },
      },
      allCifUsers: {
        edges: [
          {
            node: {
              rowId: 1,
              fullName: "Test full name 1",
            },
          },
          {
            node: {
              rowId: 2,
              fullName: "Test full name 2",
            },
          },
        ],
      },
    };
  },
};

const defaultComponentProps: ValidatingFormProps = {
  setValidatingForm: jest.fn(),
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectManagerFormGroupQuery>({
    component: ProjectManagerFormGroup,
    testQuery: testQuery,
    compiledQuery: compiledProjectManagerFormGroupQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
      revision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: { projectRevision: "Test Revision ID" },
    defaultComponentProps: defaultComponentProps,
  });

describe("The ProjectManagerForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    componentTestingHelper.reinit();
  });

  it("Renders a form for each Project Manager Label", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(screen.getAllByRole("combobox")).toHaveLength(4);
  });

  it("Renders any data contained in a formChange", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    expect(
      screen.getAllByPlaceholderText("Select a Project Manager")[1]
    ).toHaveValue("Test full name 2");
  });

  it("Calls the addManagerToRevision mutation when a new selection is made in the Manager dropdown", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getAllByTitle("Open")[0]);
    fireEvent.click(screen.getByText("Test full name 1"));

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables
    ).toMatchObject({
      projectRevision: "Test Revision ID",
      projectRevisionId: 1,
      newFormData: { cifUserId: 1, projectId: 1, projectManagerLabelId: 1 },
    });
  });

  it("Calls the update mutation when change is made in the Manager dropdown", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getAllByTitle("Open")[1]);
    fireEvent.click(screen.getByText("Test full name 1"));

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        input: {
          formChangePatch: {
            changeStatus: "pending",
            newFormData: {
              cifUserId: 1,
              projectId: 1,
              projectManagerLabelId: 2,
            },
          },
          id: "Change 2 ID",
        },
      },
    });
  });

  it("Deletes the formChange record when the remove button is clicked and the formChange operation is 'CREATE'", () => {
    const deleteMutationSpy = jest.fn();
    const inFlight = false;
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [deleteMutationSpy, inFlight]);
    componentTestingHelper.loadQuery();

    componentTestingHelper.renderComponent();
    const clearButton = screen.getAllByText("Clear")[1];
    clearButton.click();

    expect(deleteMutationSpy).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "Change 2 ID",
        },
        projectRevision: "Test Revision ID",
      },
    });
  });

  it("Updates the formChange record with operation = 'ARCHIVE' when the remove button is clicked and the formChange operation is 'UPDATE'", () => {
    const deleteMutationSpy = jest.fn();
    const inFlight = false;
    jest
      .spyOn(require("mutations/useMutationWithErrorMessage"), "default")
      .mockImplementation(() => [deleteMutationSpy, inFlight]);
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    const clearButton = screen.getAllByText("Clear")[2];
    clearButton.click();

    expect(deleteMutationSpy).toHaveBeenCalledWith({
      variables: {
        input: {
          formChangePatch: {
            operation: "ARCHIVE",
          },
          id: "Change 3 ID",
        },
        projectRevision: "Test Revision ID",
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: "Change 3 ID",
            newFormData: {},
            operation: "ARCHIVE",
          },
        },
      },
    });
  });

  it("stages the form changes when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();
    screen.getByText(/submit/i).click();
    const allOperations =
      componentTestingHelper.environment.mock.getAllOperations();
    expect(allOperations.length).toEqual(4); // first operation is special; next three are form_change (there are 4 managers but only 3 have form_change)
    for (let i = 1; i < allOperations.length; i++) {
      expect(allOperations[i].request.variables.input).toMatchObject({
        formChangePatch: { changeStatus: "staged" },
      });
    }
  });

  it("reverts the form_change status to 'pending' when editing", async () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          projectRevision: {
            id: "Test Revision ID",
            rowId: 1,
            managerFormChanges: {
              edges: [
                {
                  node: {
                    projectManagerLabel: {
                      id: "Test Label 1 ID",
                      rowId: 1,
                      label: "Test Label 1",
                    },
                    formChange: null,
                  },
                },
                {
                  node: {
                    projectManagerLabel: {
                      id: "Test Label 2 ID",
                      rowId: 2,
                      label: "Test Label 2",
                    },
                    formChange: {
                      id: "Change 2 ID",
                      operation: "CREATE",
                      changeStatus: "staged",
                      newFormData: {
                        cifUserId: 2,
                        projectId: 1,
                        projectManagerLabelId: 2,
                      },
                    },
                  },
                },
                {
                  node: {
                    projectManagerLabel: {
                      id: "Test Label 3 ID",
                      rowId: 3,
                      label: "Test Label 3",
                    },
                    formChange: {
                      id: "Change 3 ID",
                      operation: "UPDATE",
                      changeStatus: "staged",
                      newFormData: {
                        cifUserId: 2,
                        projectId: 1,
                        projectManagerLabelId: 3,
                      },
                    },
                  },
                },
              ],
            },
            projectFormChange: {
              formDataRecordId: 1,
            },
          },
          allCifUsers: {
            edges: [
              {
                node: {
                  rowId: 1,
                  fullName: "Test full name 1",
                },
              },
              {
                node: {
                  rowId: 2,
                  fullName: "Test full name 2",
                },
              },
            ],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();
    await act(async () => {
      userEvent.click(screen.getByLabelText(/test label 3/i));
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText(/Test full name 1/i)
      );
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { cifUserId: 1, projectId: 1, projectManagerLabelId: 3 },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when a new selection is made in the Manager dropdown", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `addManagerToRevisionMutation`,
    // Warning: RelayResponseNormalizer: Payload did not contain a value for field `id: id`. Check that you are parsing with the same query that was used to fetch the payload.
    // RelayObservable: Unhandled Error Error: at /home/briannacerkiewicz/cas-cif/app/tests/unit/components/Form/ProjectManagerForm.test.tsx:220:50
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getAllByTitle("Open")[0]);
    fireEvent.click(screen.getByText("Test full name 1"));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while adding a manager to the project."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message when change is made in the Manager dropdown", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `updateFormChangeMutation`,
    //Warning: RelayResponseNormalizer: Payload did not contain a value for field `operation: operation`. Check that you are parsing with the same query that was used to fetch the payload.
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    fireEvent.click(screen.getAllByTitle("Open")[1]);
    fireEvent.click(screen.getByText("Test full name 1"));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred when updating the project manager form."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message when the remove button is clicked and the formChange operation is 'CREATE'", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const clearButton = screen.getAllByText("Clear")[1];
    clearButton.click();
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while removing the manager from the project."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message hen the remove button is clicked and the formChange operation is 'UPDATE'", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `deleteManagerFromRevisionWithArchiveMutation`,
    //Warning: RelayResponseNormalizer: Payload did not contain a value for field `query: query`. Check that you are parsing with the same query that was used to fetch the payload.
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const clearButton = screen.getAllByText("Clear")[2];
    clearButton.click();
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while removing the manager from the project."
    );
  });

  it("calls the undoFormChangesMutation when the user clicks the Undo Changes button", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

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
        // The whole `formChange` object is null before a manager is selected, so there's no form change id (comes from `rowId`). TODO: update this test and mock data when/if that changes.
        formChangesIds: [undefined, 9, 10, 11],
      },
    });
  });
});
