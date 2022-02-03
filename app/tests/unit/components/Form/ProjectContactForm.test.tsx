import { render, screen } from "@testing-library/react";
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

jest.mock("lib/helpers/validateFormWithErrors");

const loadedQuery = graphql`
  query ProjectContactFormQuery($projectRevision: ID!) @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectContactForm_query
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
  return <ProjectContactForm {...props} query={data.query} />;
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
        id: "Test Project Revision ID",
        rowId: 1234,
        formChangesByProjectRevisionId: {
          edges: [
            {
              node: {
                id: "Form ID 1",
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
                newFormData: {
                  projectId: 10,
                  contactId: 1,
                  contactIndex: 5,
                },
              },
            },
          ],
        },
      },
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
    jest.resetAllMocks();

    environment = createMockEnvironment();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, getMockQueryPayload())
    );

    environment.mock.queuePendingOperation(compiledProjectContactFormQuery, {});
  });

  it("Matches the snapshot with a primary contact and multiple secondary contacts", () => {
    const componentUnderTest = renderProjectForm();
    expect(componentUnderTest.container).toMatchSnapshot();

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
          formChangePatch: {
            deletedAt: expect.any(String),
          },
        },
      },
      onCompleted: expect.any(Function),
      updater: expect.any(Function),
      optimisticResponse: {
        updateFormChange: {
          __typename: "UpdateFormChangePayload",
        },
      },
    });
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

    props.setValidatingForm.mock.calls[0][0].selfValidate();

    // Once per form
    expect(mocked(validateFormWithErrors)).toHaveBeenCalledTimes(3);
  });
});
