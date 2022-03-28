import { render, screen, act } from "@testing-library/react";
import { ValidatingFormProps } from "components/Form/Interfaces/FormValidationTypes";
import ProjectContactForm from "components/Form/ProjectContactForm";
import {
  graphql,
  RelayEnvironmentProvider,
  useLazyLoadQuery,
} from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import compiledProjectContactFormQuery, {
  ProjectContactFormQuery,
} from "__generated__/ProjectContactFormQuery.graphql";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import { mocked } from "jest-mock";
import { ProjectContactForm_projectRevision } from "__generated__/ProjectContactForm_projectRevision.graphql";
import userEvent from "@testing-library/user-event";
// import { act } from "react-test-renderer";

jest.mock("lib/helpers/validateFormWithErrors");

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

describe("The ProjectContactForm", () => {
  beforeEach(() => {
    jest.restoreAllMocks();

    environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, getMockQueryPayload())
    );

    environment.mock.queuePendingOperation(compiledProjectContactFormQuery, {});
  });

  it("Renders a primary contact and multiple secondary contacts", () => {
    renderProjectForm();

    expect(screen.getAllByRole("textbox")).toHaveLength(3);

    // Remove buttons only appear on alternate contacs
    expect(screen.getAllByText("Remove")).toHaveLength(2);
  });

  it("Calls the addContactToRevision mutation when the Add button is clicked", () => {
    const mutationSpy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mutationSpy, jest.fn()]);

    renderProjectForm();
    const addButton = screen.getByText("Add");
    addButton.click();

    expect(mutationSpy).toHaveBeenCalledWith({
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
    renderProjectForm();
    const spy = jest.spyOn(
      require("app/mutations/useMutationWithErrorMessage"),
      "default"
    );

    userEvent.click(screen.getByText(/Add/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    const getErrorMessage = spy.mock.calls[0][1] as Function;

    expect(getErrorMessage()).toBe("An error occured");
  });

  it("Calls the updateFormChange mutation when the remove button is clicked", () => {
    const mutationSpy = jest.fn();
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [mutationSpy, jest.fn()]);

    renderProjectForm();
    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();

    expect(mutationSpy).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "Form ID 2",
        },
        connections: expect.any(Array),
      },
      onCompleted: expect.any(Function),
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the remove button is clicked", () => {
    renderProjectForm();
    const spy = jest.spyOn(
      require("app/mutations/useMutationWithErrorMessage"),
      "default"
    );

    const removeButton = screen.getAllByText("Remove")[0];
    removeButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    const getErrorMessage = spy.mock.calls[0][1] as Function;

    expect(getErrorMessage()).toBe("An error occured");
  });

  it("Clears the primary contact field when the Clear button is pressed", () => {
    const mutationSpy = jest.fn();
    jest
      .spyOn(require("mutations/useDebouncedMutation"), "default")
      .mockImplementation(() => [mutationSpy, jest.fn()]);

    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [jest.fn(), jest.fn()]);

    renderProjectForm();
    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();

    expect(mutationSpy).toHaveBeenCalledWith({
      variables: {
        input: {
          id: "Form ID 1",
          formChangePatch: {
            newFormData: {
              contactIndex: 1,
              projectId: 10,
            },
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            __typename: "FormChange",
            id: "Form ID 1",
            newFormData: {
              contactIndex: 1,
              projectId: 10,
            },
            operation: "CREATE",
          },
        },
      },
      debounceKey: "Form ID 1",
    });
  });

  it("calls useMutationWithErrorMessage and returns expected message when the Clear button is pressed", () => {
    //Warning: Expected `optimisticResponse` to match structure of server response for mutation `updateFormChangeMutation`
    renderProjectForm();
    const spy = jest.spyOn(
      require("app/mutations/useMutationWithErrorMessage"),
      "default"
    );

    const clearButton = screen.getAllByText("Clear")[0];
    clearButton.click();
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    const getErrorMessage = spy.mock.calls[0][1] as Function;

    expect(getErrorMessage()).toBe("An error occured");
  });

  it("Validates all contact forms when validator is called", () => {
    mocked(validateFormWithErrors).mockImplementation(() => []);
    jest
      .spyOn(require("react-relay"), "useMutation")
      .mockImplementation(() => [jest.fn(), jest.fn()]);

    renderProjectForm();

    expect(props.setValidatingForm).toHaveBeenCalledWith({
      selfValidate: expect.any(Function),
    });

    mocked(props.setValidatingForm).mock.calls[0][0].selfValidate();

    // Once per form
    expect(mocked(validateFormWithErrors)).toHaveBeenCalledTimes(3);
  });
});
