import { render, screen, act, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ValidatingFormProps } from "components/Form/Interfaces/FormValidationTypes";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { ErrorContext } from "contexts/ErrorContext";
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import compiledProjectContactFormQuery, {
  ProjectContactFormQuery,
} from "__generated__/ProjectContactFormQuery.graphql";
import { ProjectContactForm_projectRevision } from "__generated__/ProjectContactForm_projectRevision.graphql";

const loadedQuery = graphql`
  query ProjectContactFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectContactForm_query
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectContactForm_projectRevision
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
  const data = useLazyLoadQuery<ProjectContactFormQuery>(loadedQuery, {
    projectRevision: "test-project-revision",
  });
  return (
    <ProjectContactForm
      {...props}
      query={data.query}
      projectRevision={data.query.projectRevision}
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
  ProjectRevision() {
    const result: ProjectContactForm_projectRevision = {
      " $fragmentType": "ProjectContactForm_projectRevision",
      id: "Test Project Revision ID",
      rowId: 1234,
      projectContactFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Form ID 1",
              operation: "CREATE",
              changeStatus: "pending",
              updatedAt: "2020-01-01T00:00:00.000Z",
              newFormData: {
                projectId: 10,
                contactId: 2,
                contactIndex: 1,
              },
            },
          },
          {
            node: {
              id: "Form ID 2",
              operation: "CREATE",
              changeStatus: "pending",
              updatedAt: "2020-01-01T00:00:00.000Z",
              newFormData: {
                projectId: 10,
                contactId: 3,
                contactIndex: 2,
              },
            },
          },
          {
            node: {
              id: "Form ID 3",
              operation: "CREATE",
              changeStatus: "pending",
              updatedAt: "2020-01-01T00:00:00.000Z",
              newFormData: {
                projectId: 10,
                contactId: 1,
                contactIndex: 5,
              },
            },
          },
        ],
      },
    };
    return result;
  },
  Query() {
    return {
      allContacts: {
        edges: [
          {
            node: {
              rowId: 1,
              fullName: "Mister Test",
            },
          },
          {
            node: {
              rowId: 2,
              fullName: "Mister Test 2",
            },
          },
          {
            node: {
              rowId: 3,
              fullName: "Mister Test 3",
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

  environment.mock.queuePendingOperation(compiledProjectContactFormQuery, {});
};

describe("The ProjectContactForm", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("Renders a primary contact and multiple secondary contacts", () => {
    loadTestQuery();
    renderProjectForm();

    expect(screen.getAllByRole("textbox")).toHaveLength(3);

    // Remove buttons only appear on alternate contacs
    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("Calls the addContactToRevision mutation when the Add button is clicked", () => {
    loadTestQuery();
    renderProjectForm();

    const addButton = screen.getByText("Add");
    addButton.click();

    expect(environment.mock.getMostRecentOperation().request).toMatchObject({
      variables: {
        connections: expect.any(Array),
        input: {
          revisionId: 1234,
          contactIndex: 6,
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    loadTestQuery();
    renderProjectForm();

    userEvent.click(screen.getByText(/Add/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred while adding the contact to the revision."
    );
  });

  it("Calls the updateFormChange mutation when the remove button is clicked", () => {
    loadTestQuery();
    renderProjectForm();

    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();

    expect(environment.mock.getMostRecentOperation().request).toMatchObject({
      variables: {
        input: {
          id: "Form ID 2",
        },
        connections: expect.any(Array),
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the remove button is clicked", () => {
    loadTestQuery();
    renderProjectForm();

    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred when deleting."
    );
  });

  it("Clears the primary contact field when the Clear button is pressed", () => {
    loadTestQuery();
    renderProjectForm();

    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();

    expect(environment.mock.getMostRecentOperation().request).toMatchObject({
      variables: {
        input: {
          id: "Form ID 1",
          formChangePatch: {
            changeStatus: "pending",
            newFormData: {
              contactIndex: 1,
              projectId: 10,
            },
          },
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the Clear button is pressed", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `updateFormChangeMutation`
    loadTestQuery();
    renderProjectForm();

    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });

    expect(errorContext.setError).toBeCalledWith(
      "An error occurred when updating the project contact form."
    );
  });

  it("Validates all contact forms when the submit button is clicked", () => {
    loadTestQuery();
    renderProjectForm();

    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );

    screen.getByText(/Submit/i).click();
    // Once per form
    expect(validateFormWithErrors).toHaveBeenCalledTimes(3);
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
    const mockResolver = {
      ...getMockQueryPayload(),
      ProjectRevision() {
        const result: ProjectContactForm_projectRevision = {
          " $fragmentType": "ProjectContactForm_projectRevision",
          id: "Test Project Revision ID",
          rowId: 1234,
          projectContactFormChanges: {
            __id: "connection Id",
            edges: [
              {
                node: {
                  id: "Form ID 1",
                  operation: "CREATE",
                  changeStatus: "staged",
                  updatedAt: "2020-01-01T00:00:00.000Z",
                  newFormData: {
                    projectId: 10,
                    contactId: 2,
                    contactIndex: 1,
                  },
                },
              },
              {
                node: {
                  id: "Form ID 2",
                  operation: "CREATE",
                  changeStatus: "staged",
                  updatedAt: "2020-01-01T00:00:00.000Z",
                  newFormData: {
                    projectId: 10,
                    contactId: 3,
                    contactIndex: 2,
                  },
                },
              },
              {
                node: {
                  id: "Form ID 3",
                  operation: "CREATE",
                  changeStatus: "staged",
                  updatedAt: "2020-01-01T00:00:00.000Z",
                  newFormData: {
                    projectId: 10,
                    contactId: 1,
                    contactIndex: 5,
                  },
                },
              },
            ],
          },
        };
        return result;
      },
    };
    loadTestQuery(mockResolver);
    renderProjectForm();

    await act(async () => {
      userEvent.click(screen.getByLabelText(/primary contact/i));
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("Mister Test")
      );
    });

    expect(
      environment.mock.getMostRecentOperation().request.variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { contactIndex: 1, projectId: 10, contactId: 1 },
      },
    });
  });
});
