import { render, screen, fireEvent, act } from "@testing-library/react";
import ProjectForm from "components/Form/ProjectForm";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  graphql,
} from "react-relay";
import compiledProjectFormQuery, {
  ProjectFormQuery,
} from "__generated__/ProjectFormQuery.graphql";

const loadedQuery = graphql`
  query ProjectFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectForm_query
      projectRevision(id: "Test Project Revision ID") {
        ...ProjectForm_projectRevision
      }
    }
  }
`;

let environment;
const TestRenderer = (extraProps: any) => {
  const data = useLazyLoadQuery<ProjectFormQuery>(loadedQuery, {});
  return (
    <ProjectForm
      query={data.query}
      projectRevision={data.query.projectRevision}
      setValidatingForm={jest.fn()}
      {...extraProps}
    />
  );
};
const renderProjectForm = (extraProps: any = {}) => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer {...extraProps} />
    </RelayEnvironmentProvider>
  );
};

describe("The Project Form", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });
  it("matches the snapshot", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation)
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    const componentUnderTest = renderProjectForm();
    expect(componentUnderTest.container).toMatchSnapshot();
  });
  it("calls the mutation passed in with the props with the proper data on form change", () => {
    const mockUpdateProjectFormChange = jest.fn();

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation)
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm({
      updateProjectFormChange: mockUpdateProjectFormChange,
    });

    fireEvent.change(screen.getByLabelText("Proposal Reference"), {
      target: { value: "testidentifier" },
    });

    expect(mockUpdateProjectFormChange).toHaveBeenCalledOnce();
    expect(mockUpdateProjectFormChange).toHaveBeenCalledWith({
      optimisticResponse: expect.any(Object),
      debounceKey: expect.any(String),
      variables: {
        input: {
          id: expect.any(String),
          formChangePatch: {
            newFormData: expect.objectContaining({
              proposalReference: "testidentifier",
            }),
          },
        },
      },
    });
    mockUpdateProjectFormChange.mockClear();

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    expect(mockUpdateProjectFormChange).toHaveBeenCalledWith({
      optimisticResponse: expect.any(Object),
      debounceKey: expect.any(String),
      variables: {
        input: {
          id: expect.any(String),
          formChangePatch: {
            newFormData: expect.objectContaining({
              proposalReference: "testidentifier",
              summary: "testsummary",
            }),
          },
        },
      },
    });
  });
  it("loads with the correct initial form data", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ProjectRevision() {
          return {
            id: "Test Project Revision ID",
            projectFormChange: {
              id: "Test Project Form Change ID",
              isUniqueValue: true,
              newFormData: {
                proposalReference: "12345678",
                summary: "d",
                operatorId: 1,
                fundingStreamRfpId: 1,
              },
            },
          };
        },
        Query() {
          return {
            allOperators: {
              edges: [
                {
                  node: {
                    rowId: 1,
                    legalName: "test operator",
                    bcRegistryId: "1234abcd",
                  },
                },
              ],
            },
            allFundingStreams: {
              edges: [
                {
                  node: {
                    rowId: 1,
                    name: "EP",
                    description: "Emissions Performance",
                  },
                },
              ],
            },
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    expect(
      screen.getByLabelText<HTMLInputElement>("Proposal Reference").value
    ).toBe("12345678");
    expect(screen.getByLabelText<HTMLInputElement>("Summary").value).toBe("d");
    expect(
      screen.getByPlaceholderText<HTMLSelectElement>("Select an Operator").value
    ).toBe("test operator (1234abcd)");
  });
  it("Displays an error message upon validation when the proposal reference is not unique", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ProjectRevision() {
          return {
            id: "Test Project Revision ID",
            projectFormChange: {
              id: "Test Project Form Change ID",
              isUniqueValue: false,
              newFormData: {
                proposalReference: "12345678",
                summary: "d",
                operatorId: 1,
                fundingStreamRfpId: 1,
              },
            },
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    let validateFormMethod;

    renderProjectForm({
      setValidatingForm: (validator) =>
        (validateFormMethod = validator.selfValidate),
    });

    expect(validateFormMethod).not.toBeNull();

    act(() => {
      validateFormMethod();
    });

    expect(
      screen.getByText(/Proposal reference already exists in the system./i)
    ).toBeInTheDocument();
  });
});
