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
import { RouterContext } from "next/dist/shared/lib/router-context";
import createMockNextRouter from "./mockNextRouter";

interface PageTestingHelperOptions<TQuery extends OperationType> {
  pageComponent: (props: RelayProps<{}, TQuery>) => JSX.Element;
  compiledQuery: ConcreteRequest;
  defaultQueryResolver?: MockResolvers;
  defaultQueryVariables?: TQuery["variables"];
}

class PageTestingHelper<TQuery extends OperationType> {
  public environment: RelayMockEnvironment;

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

  public renderPageWithMockRouter(routerOpts) {
    const router = createMockNextRouter(routerOpts);
    return render(
      <ErrorContext.Provider value={this.errorContext}>
        <RouterContext.Provider value={router as any}>
          <RelayEnvironmentProvider environment={this.environment}>
            <this.options.pageComponent
              CSN
              preloadedQuery={this.initialQueryRef}
            />
          </RelayEnvironmentProvider>
        </RouterContext.Provider>
      </ErrorContext.Provider>
    );
  }
}

export default PageTestingHelper;
