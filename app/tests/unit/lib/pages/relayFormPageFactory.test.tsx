import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import relayFormPageFactory from "lib/pages/relayFormPageFactory";
import { useDeleteFormChange } from "mutations/FormChange/deleteFormChange";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import { act } from "react-dom/test-utils";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import { GraphQLResponse } from "relay-runtime";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import compiledRelayFormPageFactoryQuery, {
  relayFormPageFactoryQuery,
} from "__generated__/relayFormPageFactoryQuery.graphql";

jest.mock("mutations/FormChange/updateFormChange");
jest.mock("mutations/FormChange/deleteFormChange");

let environment: RelayMockEnvironment;

const loadFormChangeData = (additionalData = {}) => {
  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, {
      FormChange() {
        return {
          id: "test-cif-form-id",
          newFormData: "{}",
          formDataRecordId: "mock-form-data-record-id",
          updatedAt: "2020-01-01T00:00:00.000Z",
          ...additionalData,
        };
      },
    });
  });

  const variables = {
    form: "mock-contact-id",
  };
  environment.mock.queuePendingOperation(
    compiledRelayFormPageFactoryQuery,
    variables
  );
  return loadQuery<relayFormPageFactoryQuery>(
    environment,
    compiledRelayFormPageFactoryQuery,
    variables
  );
};

const loadUndefinedFormChangeData = () => {
  environment.mock.queueOperationResolver(() => {
    return {
      data: {
        session: null,
        formChange: null,
      },
    } as GraphQLResponse;
  });

  const variables = {
    form: "mock-contact-id",
  };
  environment.mock.queuePendingOperation(
    compiledRelayFormPageFactoryQuery,
    variables
  );
  return loadQuery<relayFormPageFactoryQuery>(
    environment,
    compiledRelayFormPageFactoryQuery,
    variables
  );
};

describe("The relay form page factory", () => {
  beforeEach(() => {
    mocked(useUpdateFormChange).mockReturnValue([jest.fn(), false]);
    mocked(useDeleteFormChange).mockReturnValue([jest.fn(), false]);
    environment = createMockEnvironment();
  });

  it("Returns a component and a graphql tagged node", () => {
    const [TestFormPage, testFormPageQuery] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      () => <div>Test Component</div>
    );

    expect(TestFormPage).not.toBeNull();
    expect(testFormPageQuery).not.toBeNull();
  });

  it("Renders the passed component with the application layout", () => {
    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      () => <div>Test Component</div>
    );

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestFormPage CSN preloadedQuery={loadFormChangeData(environment)} />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.getByText("Test Component")).toBeVisible();
  });

  it("Renders a 404 when the form doesnt exist", async () => {
    const routerReplaceSpy = jest.fn();
    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { replace: routerReplaceSpy };
    });

    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      () => <div>Test Component</div>
    );

    await act(async () => {
      render(
        <RelayEnvironmentProvider environment={environment}>
          <TestFormPage CSN preloadedQuery={loadUndefinedFormChangeData()} />
        </RelayEnvironmentProvider>
      );
    });

    expect(routerReplaceSpy).toHaveBeenCalledWith("/404");
  });

  it("Passes the form data to the component being rendered", () => {
    const propsSpy = jest.fn();

    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      (props) => {
        propsSpy(props);
        return <div>Test Component</div>;
      }
    );

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestFormPage
          CSN
          preloadedQuery={loadFormChangeData({
            newFormData: {
              test: "testFormData",
            },
          })}
        />
      </RelayEnvironmentProvider>
    );

    expect(propsSpy).toBeCalledWith(
      expect.objectContaining({ formData: { test: "testFormData" } })
    );
  });

  it("Passes the change function to the component being rendered", () => {
    const mockUpdateFormChange = jest.fn();
    mocked(useUpdateFormChange).mockReturnValue([mockUpdateFormChange, false]);

    let changeFunctionUnderTest = null;
    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      (props) => {
        changeFunctionUnderTest = props.onChange;
        return <div>Test Component</div>;
      }
    );

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestFormPage CSN preloadedQuery={loadFormChangeData()} />
      </RelayEnvironmentProvider>
    );

    const testChangeFormData = {
      testNumber: 123,
      testText: "1, 2 then 3",
    };

    changeFunctionUnderTest({
      formData: testChangeFormData,
    });

    expect(mockUpdateFormChange).toHaveBeenCalledWith({
      debounceKey: "test-cif-form-id",
      onError: expect.any(Function),
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: "test-cif-form-id",
            newFormData: testChangeFormData,
          },
        },
      },
      variables: {
        input: {
          formChangePatch: { newFormData: testChangeFormData },
          id: "test-cif-form-id",
        },
      },
    });
  });

  it("Passes the submit function to the component being rendered", () => {
    const mockSubmitFormChange = jest.fn();
    mocked(useUpdateFormChange).mockReturnValue([mockSubmitFormChange, false]);

    let submitFunctionUnderTest = null;
    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      (props) => {
        submitFunctionUnderTest = props.onSubmit;
        return <div>Test Component</div>;
      }
    );

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestFormPage CSN preloadedQuery={loadFormChangeData()} />
      </RelayEnvironmentProvider>
    );

    const testChangeFormData = {
      testNumber: 123,
      testSubmitted: "submitted!",
    };

    submitFunctionUnderTest({
      formData: testChangeFormData,
    });

    expect(mockSubmitFormChange).toHaveBeenCalledWith({
      debounceKey: "test-cif-form-id",
      onError: expect.any(Function),
      onCompleted: expect.any(Function),
      variables: {
        input: {
          formChangePatch: {
            newFormData: testChangeFormData,
            changeStatus: "committed",
          },
          id: "test-cif-form-id",
        },
      },
    });
  });

  it("Passes the discard function to the component being rendered", () => {
    const mockDeleteFormChange = jest.fn();
    mocked(useDeleteFormChange).mockReturnValue([mockDeleteFormChange, false]);

    let discardFunctionUnderTest = null;
    const [TestFormPage] = relayFormPageFactory(
      "Test Resource",
      "testRoute",
      (props) => {
        discardFunctionUnderTest = props.onDiscard;
        return <div>Test Component</div>;
      }
    );

    render(
      <RelayEnvironmentProvider environment={environment}>
        <TestFormPage CSN preloadedQuery={loadFormChangeData()} />
      </RelayEnvironmentProvider>
    );

    discardFunctionUnderTest();

    expect(mockDeleteFormChange).toHaveBeenCalledWith({
      onCompleted: expect.any(Function),
      variables: {
        input: {
          id: "test-cif-form-id",
        },
      },
    });
  });
});
