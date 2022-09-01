import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectContactFormQuery, {
  ProjectContactFormQuery,
} from "__generated__/ProjectContactFormQuery.graphql";

const testQuery = graphql`
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

const mockQueryPayload = {
  ProjectRevision() {
    const result: any = {
      " $fragmentType": "ProjectContactForm_projectRevision",
      id: "Test Project Revision ID",
      rowId: 1234,
      projectContactFormChanges: {
        __id: "connection Id",
        edges: [
          {
            node: {
              id: "Form ID 1",
              rowId: 4,
              operation: "CREATE",
              changeStatus: "pending",
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
              rowId: 5,
              operation: "CREATE",
              changeStatus: "pending",
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
              rowId: 6,
              operation: "CREATE",
              changeStatus: "pending",
              newFormData: {
                projectId: 10,
                contactId: 1,
                contactIndex: 5,
              },
            },
          },
          {
            node: {
              id: "Form ID 4",
              rowId: 7,
              operation: "ARCHIVE",
              changeStatus: "pending",
              newFormData: {
                projectId: 10,
                contactId: 2,
                contactIndex: 6,
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
};

const defaultComponentProps = {
  setValidatingForm: jest.fn(),
  onSubmit: jest.fn(),
};

const componentTestingHelper =
  new ComponentTestingHelper<ProjectContactFormQuery>({
    component: ProjectContactForm,
    testQuery: testQuery,
    compiledQuery: compiledProjectContactFormQuery,
    getPropsFromTestQuery: (data) => ({
      query: data.query,
      projectRevision: data.query.projectRevision,
    }),
    defaultQueryResolver: mockQueryPayload,
    defaultQueryVariables: {},
    defaultComponentProps: defaultComponentProps,
  });

describe("The ProjectContactForm", () => {
  beforeEach(() => {
    componentTestingHelper.reinit();
  });

  it("Renders a primary contact and multiple secondary contacts", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    expect(screen.getAllByRole("combobox")).toHaveLength(3);

    // Clear button only appear one time
    expect(screen.getAllByText("Clear")).toHaveLength(1);

    // Remove buttons only appear on alternate contacts
    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("Calls the addContactToRevision mutation when the Add a secondary contact button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const addButton = screen.getByText("Add a secondary contact");
    addButton.click();

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
      variables: {
        connections: expect.any(Array),
        input: {
          revisionId: 1234,
          contactIndex: 6,
        },
      },
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add a secondary contact button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Add a secondary contact/i));
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred while adding the contact to the revision."
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
          id: "Form ID 2",
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

  it("Clears the primary contact field when the Clear button is pressed", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();

    componentTestingHelper.expectMutationToBeCalled(
      "updateProjectContactFormChangeMutation",
      {
        input: {
          rowId: 4,
          formChangePatch: expect.any(Object),
        },
      }
    );
  });

  it("calls useMutationWithErrorMessage and returns expected message when the Clear button is pressed", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `updateFormChangeMutation`
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();
    act(() => {
      componentTestingHelper.environment.mock.rejectMostRecentOperation(
        new Error()
      );
    });

    expect(componentTestingHelper.errorContext.setError).toBeCalledWith(
      "An error occurred when updating the project contact form."
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
    expect(validateFormWithErrors).toHaveBeenCalledTimes(3);
  });

  it("does not throw validation errors when primary contact is blank", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: any = {
          " $fragmentType": "ProjectContactForm_projectRevision",
          id: "Test Project Revision ID",
          rowId: 1234,
          projectContactFormChanges: {
            __id: "connection Id",
            edges: [],
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
    componentTestingHelper.renderComponent();

    const validateFormWithErrors = jest.spyOn(
      require("lib/helpers/validateFormWithErrors"),
      "default"
    );

    screen.getByText(/submit/i).click();
    expect(validateFormWithErrors).toHaveReturnedWith([]);
  });

  it("calls the correct staging mutation when the `submit` button is clicked", () => {
    componentTestingHelper.loadQuery({
      ProjectRevision() {
        const result: any = {
          " $fragmentType": "ProjectContactForm_projectRevision",
          id: "Test Project Revision ID",
          rowId: 1234,
          projectContactFormChanges: {
            __id: "connection Id",
            edges: [
              {
                node: {
                  id: "Form ID 1",
                  rowId: 4,
                  operation: "CREATE",
                  changeStatus: "pending",
                  newFormData: {
                    projectId: 10,
                    contactId: 2,
                    contactIndex: 1,
                  },
                  asProjectContact: undefined,
                },
              },
            ],
          },
        };
        return result;
      },
    });
    componentTestingHelper.renderComponent();
    screen.getByText(/submit/i).click();
    componentTestingHelper.expectMutationToBeCalled("stageFormChangeMutation", {
      input: {
        rowId: 4,
        formChangePatch: expect.any(Object),
      },
    });
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
        formChangesIds: [4, 5, 6, 7],
      },
    });
  });

  it("Shows Create new contact button display when no contact selected and will call createNewContactFormChangeMutation on click", () => {
    componentTestingHelper.loadQuery({
      Query() {
        return {
          allContacts: {
            edges: [],
          },
        };
      },
    });
    componentTestingHelper.renderComponent();

    const createNewContactButton = screen.getByRole("button", {
      name: /create new contact/i,
    });

    expect(createNewContactButton).toBeInTheDocument();
    createNewContactButton.click();

    componentTestingHelper.expectMutationToBeCalled(
      "createNewContactFormChangeMutation",
      {}
    );
  });
  it("calls the deleteFormChangeWithConnectionMutation twice when user clicks remove button and we have no primary contact selected and one secondary contact", () => {
    const mockResolver = {
      ...mockQueryPayload,
      ProjectRevision() {
        const result: any = {
          " $fragmentType": "ProjectContactForm_projectRevision",
          id: "Test Project Revision ID",
          rowId: 1234,
          projectContactFormChanges: {
            __id: "connection Id",
            edges: [
              {
                node: {
                  id: "Form ID 1",
                  rowId: 1,
                  operation: "CREATE",
                  changeStatus: "pending",
                  newFormData: {
                    projectId: 10,
                    contactIndex: 1,
                  },
                },
              },
              {
                node: {
                  id: "Form ID 2",
                  rowId: 2,
                  operation: "CREATE",
                  changeStatus: "pending",
                  newFormData: {
                    projectId: 10,
                    contactIndex: 2,
                  },
                },
              },
            ],
          },
        };
        return result;
      },
    };
    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    userEvent.click(
      screen.getByRole("button", {
        name: /remove/i,
      })
    );

    expect(
      componentTestingHelper.environment.mock.getAllOperations()
    ).toHaveLength(3);

    const firstMutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[1];

    expect(firstMutationUnderTest.fragment.node.name).toBe(
      "deleteFormChangeWithConnectionMutation"
    );

    expect(firstMutationUnderTest.request.variables).toMatchObject({
      input: {
        id: "Form ID 1",
      },
    });

    const secondMutationUnderTest =
      componentTestingHelper.environment.mock.getAllOperations()[2];

    expect(secondMutationUnderTest.fragment.node.name).toBe(
      "deleteFormChangeWithConnectionMutation"
    );

    expect(secondMutationUnderTest.request.variables).toMatchObject({
      input: {
        id: "Form ID 2",
      },
    });
  });
});
