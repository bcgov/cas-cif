import { render, screen, fireEvent } from "@testing-library/react";
import { ValidatingFormProps } from "components/Form/Interfaces/FormValidationTypes";
import ProjectManagerFormGroup from "components/Form/ProjectManagerFormGroup";
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import compiledProjectManagerFormQuery, {
  ProjectManagerFormQuery,
} from "__generated__/ProjectManagerFormQuery.graphql";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { mocked } from "jest-mock";

jest.mock("lib/helpers/validateFormWithErrors");

const loadedQuery = graphql`
  query ProjectManagerFormQuery($projectRevision: ID!) @relay_test_operation {
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

let environment;
const TestRenderer = () => {
  const data = useLazyLoadQuery<ProjectManagerFormQuery>(loadedQuery, {
    projectRevision: "test-project-revision",
  });
  return (
    <ProjectManagerFormGroup
      {...props}
      query={data.query}
      revision={data.query.projectRevision}
      projectManagerFormRef={null}
    />
  );
};
const renderProjectForm = () => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer />
    </RelayEnvironmentProvider>
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
              firstName: "Test First Name 1",
              lastName: "Test Last Name 1",
            },
          },
          {
            node: {
              rowId: 2,
              firstName: "Test First Name 2",
              lastName: "Test Last Name 2",
            },
          },
        ],
      },
    };
  },
});

describe("The ProjectManagerForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, getMockQueryPayload())
    );

    environment.mock.queuePendingOperation(compiledProjectManagerFormQuery, {});
  });

  it("Renders a form for each Project Manager Label", () => {
    renderProjectForm();
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
  });

  it("Renders any data contained in a formChange", () => {
    renderProjectForm();
    expect(
      screen.getAllByPlaceholderText("Select a Project Manager")[1]
    ).toHaveValue("Test First Name 2 Test Last Name 2");
  });

  it("Calls the addManagerToRevision mutation when a new selection is made in the Manager dropdown", () => {
    const mutationSpy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mutationSpy, jest.fn()]);

    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[0]);
    fireEvent.click(screen.getByText("Test First Name 1 Test Last Name 1"));

    expect(mutationSpy).toHaveBeenCalledWith({
      optimisticResponse: {
        createFormChange: {
          query: {
            projectRevision: {
              managerFormChanges: {
                edges: {
                  change: {
                    projectManagerLabel: {},
                    formChange: {
                      id: "new",
                      newFormData: {
                        cifUserId: 1,
                        projectId: 1,
                        projectManagerLabelId: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      variables: {
        projectRevision: "Test Revision ID",
        projectRevisionId: 1,
        newFormData: { cifUserId: 1, projectId: 1, projectManagerLabelId: 1 },
      },
    });
  });

  it("Calls the update mutation when change is made in the Manager dropdown", () => {
    const mutationSpy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mutationSpy, jest.fn()]);

    renderProjectForm();

    fireEvent.click(screen.getAllByTitle("Open")[1]);
    fireEvent.click(screen.getByText("Test First Name 1 Test Last Name 1"));

    expect(mutationSpy).toHaveBeenCalledWith({
      debounceKey: "Change 2 ID",
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: "Change 2 ID",
            newFormData: {
              cifUserId: 1,
              projectId: 1,
              projectManagerLabelId: 2,
            },
          },
        },
      },
      variables: {
        input: {
          formChangePatch: {
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

    renderProjectForm();
    const clearButton = screen.getAllByText("Clear")[1];
    clearButton.click();

    expect(deleteMutationSpy).toHaveBeenCalledWith({
      onError: expect.any(Function),
      onCompleted: undefined,
      variables: {
        connections: undefined,
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

    renderProjectForm();
    const clearButton = screen.getAllByText("Clear")[2];
    clearButton.click();

    expect(deleteMutationSpy).toHaveBeenCalledWith({
      onError: expect.any(Function),
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

  it("Validates all Manager forms when validator is called", () => {
    mocked(validateFormWithErrors).mockImplementation(() => []);
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [jest.fn(), jest.fn()]);

    renderProjectForm();

    expect(props.setValidatingForm).toHaveBeenCalledWith({
      selfValidate: expect.any(Function),
    });

    props.setValidatingForm.mock.calls[0][0].selfValidate();

    // Once per form
    expect(mocked(validateFormWithErrors)).toHaveBeenCalledTimes(3);
  });
});
