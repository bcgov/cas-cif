import { render } from "@testing-library/react";
import { MockPayloadGenerator } from "relay-test-utils";
import { ErrorContext } from "contexts/ErrorContext";
import {
  loadQuery,
  PreloadedQuery,
  RelayEnvironmentProvider,
} from "react-relay";
import { RelayProps } from "relay-nextjs";
import { ConcreteRequest, OperationType } from "relay-runtime";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { RouterContext } from "next/dist/shared/lib/router-context.shared-runtime";
import TestingHelper from "./TestingHelper";

interface PageTestingHelperOptions<TQuery extends OperationType> {
  pageComponent: (props: RelayProps<{}, TQuery>) => JSX.Element;
  compiledQuery: ConcreteRequest;
  defaultQueryResolver?: MockResolvers;
  defaultQueryVariables?: TQuery["variables"];
}

class PageTestingHelper<TQuery extends OperationType> extends TestingHelper {
  private options: PageTestingHelperOptions<TQuery>;

  constructor(options: PageTestingHelperOptions<TQuery>) {
    super();
    this.options = {
      defaultQueryResolver: {},
      defaultQueryVariables: {},
      ...options,
    };

    this.reinit();
  }

  public reinit() {
    super.reinit();

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
        <RouterContext.Provider value={this.router}>
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
