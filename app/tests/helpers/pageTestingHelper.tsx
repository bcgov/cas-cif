import { act, render } from "@testing-library/react";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { ErrorContext } from "contexts/ErrorContext";
import {
  loadQuery,
  PreloadedQuery,
  RelayEnvironmentProvider,
} from "react-relay";
import { RelayProps } from "relay-nextjs";
import { ConcreteRequest, OperationType } from "relay-runtime";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { createMockRouter } from "./mockNextRouter";
import { mocked } from "jest-mock";
import { NextRouter, useRouter } from "next/router";

interface PageTestingHelperOptions<TQuery extends OperationType> {
  pageComponent: (props: RelayProps<{}, TQuery>) => JSX.Element;
  compiledQuery: ConcreteRequest;
  defaultQueryResolver?: MockResolvers;
  defaultQueryVariables?: TQuery["variables"];
  routerOptions?: Partial<NextRouter>;
}

class PageTestingHelper<TQuery extends OperationType> {
  public environment: RelayMockEnvironment;

  public router: NextRouter;

  public errorContext: {
    error: any;
    setError: any;
  };

  private options: PageTestingHelperOptions<TQuery>;

  constructor(options: PageTestingHelperOptions<TQuery>) {
    this.options = {
      defaultQueryResolver: {},
      defaultQueryVariables: {},
      ...options,
    };

    this.reinit();
  }

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
    this.initialQueryRef = null;
    this.router = createMockRouter();
  }

  public setRouterOptions(routerOptions: Partial<NextRouter>) {
    this.router = createMockRouter(routerOptions);
  }

  private initialQueryRef: PreloadedQuery<TQuery>;

  public loadQuery(queryResolver?: MockResolvers) {
    this.environment.mock.queueOperationResolver((operation) => {
      return MockPayloadGenerator.generate(
        operation,
        queryResolver ?? this.options.defaultQueryResolver
      );
    });

    this.environment.mock.queuePendingOperation(
      this.options.compiledQuery,
      this.options.defaultQueryVariables
    );

    this.initialQueryRef = loadQuery<TQuery>(
      this.environment,
      this.options.compiledQuery,
      this.options.defaultQueryVariables
    );
  }

  public renderPage() {
    mocked(useRouter).mockReturnValue(this.router);

    return render(
      <ErrorContext.Provider value={this.errorContext}>
        <RelayEnvironmentProvider environment={this.environment}>
          <this.options.pageComponent
            CSN
            preloadedQuery={this.initialQueryRef}
          />
        </RelayEnvironmentProvider>
      </ErrorContext.Provider>
    );
  }
}

export default PageTestingHelper;
