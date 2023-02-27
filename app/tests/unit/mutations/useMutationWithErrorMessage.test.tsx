import { renderHook, act } from "@testing-library/react";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import * as Sentry from "@sentry/nextjs";
import React from "react";
import { ErrorContext } from "contexts/ErrorContext";
import { RelayEnvironmentProvider } from "react-relay";
import { createMockEnvironment } from "relay-test-utils";

jest.mock("@sentry/nextjs");

let errorContext;
describe("The useMutationWithErrorMessage hook", () => {
  const environment = createMockEnvironment();
  beforeEach(() => {
    errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          errorContext.error = error;
        })
      ),
    };
  });

  it("should setError when there's an error", () => {
    const wrapper = ({ children }) => (
      <ErrorContext.Provider value={errorContext}>
        <RelayEnvironmentProvider environment={environment}>
          {children}
        </RelayEnvironmentProvider>
      </ErrorContext.Provider>
    );

    const getErrorMessage = jest
      .fn()
      .mockImplementation(() => "User-friendly error");
    const { result } = renderHook(
      () =>
        useMutationWithErrorMessage(
          "some_irrelevant_graphql_for_this_test" as any,
          getErrorMessage
        ),
      { wrapper }
    );

    const error = new Error("Relay error");
    jest
      .spyOn(require("relay-runtime"), "commitMutation")
      .mockImplementation((env, commitConfig: any) => {
        commitConfig.onError(error);
      });

    const [applyMutation] = result.current;
    act(() => {
      applyMutation({ variables: {} });
    });

    expect(errorContext.setError).toHaveBeenCalledWith("User-friendly error");
    expect(getErrorMessage).toHaveBeenCalledWith(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  });
});
