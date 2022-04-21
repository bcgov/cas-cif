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
import userEvent from "@testing-library/user-event";

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

  it("calls the mutation passed in with the props with the proper data on form change", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation)
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    fireEvent.change(screen.getByLabelText("Proposal Reference"), {
      target: { value: "testidentifier" },
    });

    expect(
      environment.mock.getMostRecentOperation().request.variables
    ).toMatchObject({
      input: {
        id: expect.any(String),
        formChangePatch: {
          newFormData: expect.objectContaining({
            proposalReference: "testidentifier",
          }),
        },
      },
    });

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    expect(
      environment.mock.getMostRecentOperation().request.variables
    ).toMatchObject({
      input: {
        id: expect.any(String),
        formChangePatch: {
          newFormData: expect.objectContaining({
            proposalReference: "testidentifier",
            summary: "testsummary",
          }),
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

    renderProjectForm({});

    act(() => {
      screen.getByText(/submit/i).click();
    });

    expect(
      screen.getByText(
        /This proposal reference already exists, please specify a different one./i
      )
    ).toBeInTheDocument();
  });

  it("stages the form_change when clicking on the submit button", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ProjectRevision() {
          return {
            id: "Test Project Revision ID",
            projectFormChange: {
              id: "Test Project Form Change ID",
              isUniqueValue: true,
              changeStatus: "pending",
              newFormData: {
                proposalReference: "12345678",
                summary: "d",
                operatorId: 1,
                fundingStreamRfpId: 1,
                projectName: "test project name",
                totalFundingRequest: 12345,
                projectStatusId: 1,
                operatorTradeName: "test trade name",
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

    screen.getByText(/submit/i).click();
    expect(
      environment.mock.getMostRecentOperation().request.variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });
  it("clicking the submit button should stage a form with validation errors", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ProjectRevision() {
          return {
            id: "Test Project Revision ID",
            projectFormChange: {
              id: "Test Project Form Change ID",
              isUniqueValue: true,
              changeStatus: "pending",
              newFormData: {
                proposalReference: "12345678",
                summary: "d",
                operatorId: 1,
                fundingStreamRfpId: 1,
                projectName: "test project name",
                totalFundingRequest: null,
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

    screen.getByText(/submit/i).click();
    expect(
      environment.mock.getMostRecentOperation().request.variables.input
    ).toMatchObject({
      formChangePatch: { changeStatus: "staged" },
    });
  });
  it("reverts the form_change status to 'pending' when editing", () => {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        ProjectRevision() {
          return {
            id: "Test Project Revision ID",
            projectFormChange: {
              id: "Test Project Form Change ID",
              isUniqueValue: true,
              changeStatus: "staged",
              newFormData: {
                proposalReference: "12345678",
                summary: "d",
                operatorId: 1,
                fundingStreamRfpId: 1,
                projectName: "test project name",
                totalFundingRequest: 12345,
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

    act(() => {
      userEvent.type(screen.getByLabelText(/project name/i), "2");
    });

    expect(
      environment.mock.getMostRecentOperation().request.variables.input
    ).toMatchObject({
      formChangePatch: {
        changeStatus: "pending",
        newFormData: { projectName: "test project name2" },
      },
    });
  });
});
