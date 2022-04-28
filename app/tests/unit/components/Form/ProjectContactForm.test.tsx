import { screen, act, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProjectContactForm from "components/Form/ProjectContactForm";
import { graphql } from "react-relay";
import ComponentTestingHelper from "tests/helpers/componentTestingHelper";
import compiledProjectContactFormQuery, {
  ProjectContactFormQuery,
} from "__generated__/ProjectContactFormQuery.graphql";
import { ProjectContactForm_projectRevision } from "__generated__/ProjectContactForm_projectRevision.graphql";

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

    expect(screen.getAllByRole("textbox")).toHaveLength(3);

    // Remove buttons only appear on alternate contacs
    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("Calls the addContactToRevision mutation when the Add button is clicked", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    const addButton = screen.getByText("Add");
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

  it("calls useMutationWithErrorMessage and returns expected message when the user clicks the Add button and there's a mutation error", () => {
    componentTestingHelper.loadQuery();
    componentTestingHelper.renderComponent();

    userEvent.click(screen.getByText(/Add/i));
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

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
    ).toMatchObject({
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
      ...mockQueryPayload,
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

    componentTestingHelper.loadQuery(mockResolver);
    componentTestingHelper.renderComponent();

    await act(async () => {
      userEvent.click(screen.getByLabelText(/primary contact/i));
      await waitFor(() => screen.getByRole("presentation"));
      userEvent.click(
        within(screen.getByRole("presentation")).getByText("Mister Test")
      );
    });

    expect(
      componentTestingHelper.environment.mock.getMostRecentOperation().request
        .variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { contactIndex: 1, projectId: 10, contactId: 1 },
      },
    });
  });
});
