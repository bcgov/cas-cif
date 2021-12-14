import { render, screen, fireEvent } from "@testing-library/react";
import FormComponentProps from "components/Form/FormComponentProps";
import ProjectForm from "components/Project/ProjectForm";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import {
  RelayEnvironmentProvider,
  useLazyLoadQuery,
  graphql,
} from "react-relay";
import compiledProjectFormQuery from "__generated__/ProjectFormQuery.graphql";

const loadedQuery = graphql`
  query ProjectFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectForm_query
    }
  }
`;

const props: FormComponentProps = {
  formData: {},
  onChange: jest.fn(),
  onFormErrors: jest.fn(),
};

let environment;
const TestRenderer = () => {
  const data = useLazyLoadQuery(loadedQuery, {});
  return <ProjectForm {...props} query={data.query} />;
};
const renderProjectForm = () => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer />
    </RelayEnvironmentProvider>
  );
}

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
  it("triggers the applyFormChange with the proper data", () => {
    const changeSpy = jest.fn();

    props.onChange = changeSpy;
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation)
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();
    fireEvent.change(screen.getByLabelText("RFP Number*"), {
      target: { value: "testidentifier" },
    });

    expect(changeSpy).toHaveBeenCalledWith({
      rfpNumber: "testidentifier",
      description: undefined,
    });
    changeSpy.mockClear();

    fireEvent.change(screen.getByLabelText("Description*"), {
      target: { value: "testdescription" },
    });

    expect(changeSpy).toHaveBeenCalledWith({
      rfpNumber: "testidentifier",
      description: "testdescription",
    });
  });
  it("loads with the correct initial form data", () => {
    props.formData = {
      rfpNumber: "12345678",
      description: "d",
      operatorId: 1,
    };
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    expect(screen.getByLabelText("RFP Number*").value).toBe("12345678");
    expect(screen.getByLabelText("Description*").value).toBe("d");
    expect(screen.getByPlaceholderText("Select an Operator").value).toBe(
      "test operator (1234abcd)"
    );
  });
  it("calls onformerrors on first render if there are errors", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "",
      description: "",
      operatorId: 1,
    };
    props.onFormErrors = onFormErrorsSpy;

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: expect.anything(),
        description: null,
      })
    );
  });

  it("calls onformerrors with null if there are no errors", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999-RFP-1-123-ABCD",
      description: "d",
      operatorId: 1,
    };
    props.onFormErrors = onFormErrorsSpy;
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: null,
        description: null,
        operatorId: null,
      })
    );
  });

  it("calls onformerrors if a fields becomes empty", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999-RFP-1-123-ABCD",
      description: "desc",
    };
    props.onFormErrors = onFormErrorsSpy;

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    fireEvent.change(screen.getByLabelText("Description*"), {
      target: { value: "" },
    });

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: null,
        description: { __errors: ["is a required property"] },
      })
    );
  });

  it("calls onformerrors if the project unique id doesnt match format", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999123-RFP-1-123-ABCD",
      description: "desc",
      operatorId: 1,
    };
    props.onFormErrors = onFormErrorsSpy;

    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
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
          };
        },
      })
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: expect.anything(),
        description: null,
        operatorId: null,
      })
    );
  });
});
