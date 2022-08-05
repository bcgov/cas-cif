import { act } from "@testing-library/react";
import { NextRouter } from "next/router";
import { createMockEnvironment, RelayMockEnvironment } from "relay-test-utils";
import { createMockRouter } from "./mockNextRouter";

class TestingHelper {
  public errorContext: {
    error: any;
    setError: any;
  };

  public environment: RelayMockEnvironment;

  public router: NextRouter;

  public reinit() {
    this.environment = createMockEnvironment();
    this.errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          this.errorContext.error = error;
        })
      ),
    };
    this.router = createMockRouter();
  }

  public setMockRouterValues(routerValues: Partial<NextRouter>) {
    this.router = createMockRouter(routerValues);
  }

  public expectMutationToBeCalled(mutationName: string, variables?: any) {
    try {
      // eslint-disable-next-line jest/no-standalone-expect
      expect(this.environment.mock.getAllOperations()).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            fragment: expect.objectContaining({
              node: expect.objectContaining({
                type: "Mutation",
                name: mutationName,
              }),
            }),
            request: expect.objectContaining({
              variables,
            }),
          }),
        ])
      );
    } catch (e) {
      const allMutations = this.environment.mock
        .getAllOperations()
        .filter((op) => op?.fragment?.node?.type === "Mutation");

      const matchingReceivedMutations = allMutations.filter(
        (op) => op.fragment.node.name === mutationName
      );

      if (matchingReceivedMutations.length === 0) {
        throw new Error(
          `Expected mutation ${mutationName} to be called. Mutations called:\n` +
            `${allMutations.map((op) => op.fragment.node.name).join(", ")}`
        );
      } else
        throw new Error(
          `Expected mutation ${mutationName} to be called with:\n` +
            `${JSON.stringify(variables, null, 2)}\n` +
            `received:` +
            `${matchingReceivedMutations.map(
              (op) => `\n${JSON.stringify(op.request.variables, null, 2)}`
            )}`
        );
    }
  }
}

export default TestingHelper;
