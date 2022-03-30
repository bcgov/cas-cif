import {
  render,
  screen,
  fireEvent,
  within,
  act,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ValidatingFormProps } from "components/Form/Interfaces/FormValidationTypes";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import { ErrorContext } from "contexts/ErrorContext";
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import compiledProjectManagerFormQuery, {
  ProjectManagerFormGroupQuery,
} from "__generated__/ProjectManagerFormGroupQuery.graphql";

const loadedQuery = graphql`
  query ProjectManagerFormGroupQuery($projectRevision: ID!)
  @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectManagerFormGroup_query
      projectRevision(id: $projectRevision) {
        ...ProjectManagerFormGroup_revision
      }
    }
  }
`;

const props: ValidatingFormProps = {
  setValidatingForm: jest.fn(),
};

const errorContext = {
  error: null,
  setError: jest.fn().mockImplementation((error) =>
    act(() => {
      errorContext.error = error;
    })
  ),
};

let environment;
const TestRenderer = () => {
  const data = useLazyLoadQuery<ProjectManagerFormGroupQuery>(loadedQuery, {
    projectRevision: "test-project-revision",
  });
  return (
    <ProjectManagerFormGroup
      {...props}
      query={data.query}
      revision={data.query.projectRevision}
      onSubmit={jest.fn()}
    />
  );
};
const renderProjectForm = () => {
  return render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <TestRenderer />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );
};

const getMockQueryPayload = () => ({
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

const loadTestQuery = (mockResolver = getMockQueryPayload()) => {
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, mockResolver)
  );

  environment.mock.queuePendingOperation(compiledProjectManagerFormQuery, {});
};

describe("The ProjectManagerForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    environment = createMockEnvironment();
  });

  it("Renders a form for each Project Manager Label", () => {
    loadTestQuery();
    renderProjectForm();
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });

  it("Renders any data contained in a formChange", () => {
    loadTestQuery();
    renderProjectForm();
    expect(
      screen.getAllByPlaceholderText("Select a Project Manager")[1]
    ).toHaveValue("Test full name 2");
  });

  it("Calls the addManagerToRevision mutation when a new selection is made in the Manager dropdown", () => {
    loadTestQuery();
    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[0]);
    fireEvent.click(screen.getByText("Test full name 1"));

    expect(
      environment.mock.getMostRecentOperation().request.variables
    ).toMatchObject({
      projectRevision: "Test Revision ID",
      projectRevisionId: 1,
      newFormData: { cifUserId: 1, projectId: 1, projectManagerLabelId: 1 },
    });
  });

  it("Calls the update mutation when change is made in the Manager dropdown", () => {
    loadTestQuery();
    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[1]);
    fireEvent.click(screen.getByText("Test full name 1"));

    expect(environment.mock.getMostRecentOperation().request).toMatchObject({
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
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [deleteMutationSpy, inFlight]);
    loadTestQuery();

    renderProjectForm();
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
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [deleteMutationSpy, inFlight]);
    loadTestQuery();
    renderProjectForm();
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
    loadTestQuery();
    renderProjectForm();
    screen.getByText(/submit/i).click();
    expect(
      environment.mock.getMostRecentOperation().request.variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });

  it("reverts the form_change status to 'pending' when editing", async () => {
    loadTestQuery({
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
    renderProjectForm();
    await act(async () => {
      userEvent.click(screen.getByLabelText(/test label 3/i));
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText(/Test full name 1/i)
      );
    });

    expect(
      environment.mock.getMostRecentOperation().request.variables.input
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
    loadTestQuery();
    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[0]);
    fireEvent.click(screen.getByText("Test full name 1"));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred while adding a manager to the project."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message when change is made in the Manager dropdown", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `updateFormChangeMutation`,
    //Warning: RelayResponseNormalizer: Payload did not contain a value for field `operation: operation`. Check that you are parsing with the same query that was used to fetch the payload.
    loadTestQuery();
    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[1]);
    fireEvent.click(screen.getByText("Test full name 1"));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred when updating the project manager form."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message when the remove button is clicked and the formChange operation is 'CREATE'", () => {
    loadTestQuery();
    renderProjectForm();

    const clearButton = screen.getAllByText("Clear")[1];
    clearButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred while removing the manager from the project."
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message hen the remove button is clicked and the formChange operation is 'UPDATE'", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `deleteManagerFromRevisionWithArchiveMutation`,
    //Warning: RelayResponseNormalizer: Payload did not contain a value for field `query: query`. Check that you are parsing with the same query that was used to fetch the payload.
    loadTestQuery();
    renderProjectForm();

    const clearButton = screen.getAllByText("Clear")[2];
    clearButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred while removing the manager from the project."
    );
  });
});
