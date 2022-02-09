import { render, screen, fireEvent } from "@testing-library/react";
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
import { FormProps } from "@rjsf/core";

const loadedQuery = graphql`
  query ProjectFormQuery @relay_test_operation {
    query {
      # Spread the fragment you want to test here
      ...ProjectForm_query
    }
  }
`;

const props: FormProps<any> = {
  formData: {},
  onChange: jest.fn(),
  schema: {},
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

    expect(changeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: {
          rfpNumber: "testidentifier",
          summary: undefined,
        },
      })
    );
    changeSpy.mockClear();

    fireEvent.change(screen.getByLabelText(/summary/i), {
      target: { value: "testsummary" },
    });

    expect(changeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        formData: {
          rfpNumber: "testidentifier",
          summary: "testsummary",
        },
      })
    );
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
});
