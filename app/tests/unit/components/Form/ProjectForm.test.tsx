import { render, screen, fireEvent } from "@testing-library/react";
import FormComponentProps from "components/Form/FormComponentProps";
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
  const data = useLazyLoadQuery<ProjectFormQuery>(loadedQuery, {});
  return <ProjectForm {...props} query={data.query} />;
};
const renderProjectForm = () => {
  return render(
    <RelayEnvironmentProvider environment={environment}>
      <TestRenderer />
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
  it("triggers the applyFormChange with the proper data", () => {
    const changeSpy = jest.fn();

    props.onChange = changeSpy;
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation)
    );

    environment.mock.queuePendingOperation(compiledProjectFormQuery, {});

    renderProjectForm();
    fireEvent.change(screen.getByLabelText("RFP Number"), {
      target: { value: "testidentifier" },
    });

    expect(changeSpy).toHaveBeenCalledWith({
      rfpNumber: "testidentifier",
      summary: undefined,
    });
    changeSpy.mockClear();

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    expect(changeSpy).toHaveBeenCalledWith({
      rfpNumber: "testidentifier",
      summary: "testsummary",
    });
  });
  it("loads with the correct initial form data", () => {
    props.formData = {
      rfpNumber: "12345678",
      summary: "d",
      operatorId: 1,
      fundingStreamRfpId: 1,
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

    expect(screen.getByLabelText<HTMLInputElement>("RFP Number").value).toBe(
      "12345678"
    );
    expect(screen.getByLabelText<HTMLInputElement>("Summary").value).toBe("d");
    expect(
      screen.getByPlaceholderText<HTMLSelectElement>("Select an Operator").value
    ).toBe("test operator (1234abcd)");
  });

  // TODO remove skip and update with ticket #158
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("calls onformerrors on first render if there are errors", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "",
      summary: "",
      operatorId: 1,
      fundingStreamRfpId: 1,
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

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: expect.anything(),
        summary: null,
      })
    );
  });

  // TODO remove skip and update with ticket #158
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("calls onformerrors with null if there are no errors", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999-RFP-1-123-ABCD",
      summary: "d",
      operatorId: 1,
      fundingStreamRfpId: 1,
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

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: null,
        summary: null,
        operatorId: null,
        fundingStreamRfpId: null,
      })
    );
  });

  // TODO remove skip and update with ticket #158
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("calls onformerrors if a fields becomes empty", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999-RFP-1-123-ABCD",
      summary: "desc",
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

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "" },
    });

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: null,
        summary: { __errors: ["is a required property"] },
      })
    );
  });

  // TODO remove skip and update with ticket #158
  // eslint-disable-next-line jest/no-disabled-tests
  it.skip("calls onformerrors if the project unique id doesnt match format", () => {
    const onFormErrorsSpy = jest.fn();

    props.formData = {
      rfpNumber: "1999123-RFP-1-123-ABCD",
      summary: "desc",
      operatorId: 1,
      fundingStreamRfpId: 1,
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

    expect(onFormErrorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        rfpNumber: expect.anything(),
        summary: null,
        operatorId: null,
        fundingStreamRfpId: 1,
      })
    );
  });
});
