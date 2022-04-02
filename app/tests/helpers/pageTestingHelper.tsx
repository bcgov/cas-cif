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

class PageTestingHelper<TQuery extends OperationType> {
  public environment: RelayMockEnvironment;

  public errorContext: {
    error: any;
    setError: any;
  };

  constructor(
    private pageComponent: (props: RelayProps<{}, TQuery>) => JSX.Element,
    private compiledQuery: ConcreteRequest,
    private defaultQueryResolver: MockResolvers = {},
    private defaultQueryVariables: TQuery["variables"] = {}
  ) {
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
        queryResolver ?? this.defaultQueryResolver
      );
    });

    this.environment.mock.queuePendingOperation(
      this.compiledQuery,
      this.defaultQueryVariables
    );

    this.initialQueryRef = loadQuery<TQuery>(
      this.environment,
      this.compiledQuery,
      this.defaultQueryVariables
    );
  }

  public renderPage() {
    return render(
      <ErrorContext.Provider value={this.errorContext}>
        <RelayEnvironmentProvider environment={this.environment}>
          <this.pageComponent CSN preloadedQuery={this.initialQueryRef} />
        </RelayEnvironmentProvider>
      </ErrorContext.Provider>
    );
  }
}

export default PageTestingHelper;
