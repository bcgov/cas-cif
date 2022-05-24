import { render } from "@testing-library/react";
import { MockPayloadGenerator } from "relay-test-utils";
import { ErrorContext } from "contexts/ErrorContext";
import { RelayEnvironmentProvider, useLazyLoadQuery } from "react-relay";
import {
  ConcreteRequest,
  GraphQLTaggedNode,
  OperationType,
} from "relay-runtime";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import TestingHelper from "./TestingHelper";

interface ComponentTestingHelperOptions<TQuery extends OperationType> {
  component: (props: any) => JSX.Element;
  testQuery: GraphQLTaggedNode;
  compiledQuery: ConcreteRequest;
  getPropsFromTestQuery?: (data: TQuery["response"]) => any;
  defaultQueryResolver?: MockResolvers;
  defaultQueryVariables?: TQuery["variables"];
  defaultComponentProps?: any;
}

class ComponentTestingHelper<
  TQuery extends OperationType
> extends TestingHelper {
  private options: ComponentTestingHelperOptions<TQuery>;

  constructor(options: ComponentTestingHelperOptions<TQuery>) {
    super();
    this.options = {
      getPropsFromTestQuery: () => ({}),
      defaultQueryResolver: {},
      defaultQueryVariables: {},
      defaultComponentProps: {},
      ...options,
    };

    this.reinit();
  }

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
  }

  private TestRenderer: React.FC<{
    getPropsFromTestQuery: (data: TQuery["response"]) => any;
    extraProps: any;
  }> = ({ getPropsFromTestQuery, extraProps }) => {
    // This is fine since this is a react functional component
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const data: TQuery["response"] = useLazyLoadQuery<TQuery>(
      this.options.testQuery,
      this.options.defaultQueryVariables
    );

    return (
      <this.options.component
        {...getPropsFromTestQuery(data)}
        {...extraProps}
      />
    );
  };

  public renderComponent(
    getPropsFromTestQuery: (data: TQuery["response"]) => any = this.options
      .getPropsFromTestQuery,
    extraProps: any = this.options.defaultComponentProps
  ) {
    return render(
      <ErrorContext.Provider value={this.errorContext}>
        <RelayEnvironmentProvider environment={this.environment}>
          <this.TestRenderer
            getPropsFromTestQuery={getPropsFromTestQuery}
            extraProps={extraProps}
          />
        </RelayEnvironmentProvider>
      </ErrorContext.Provider>
    );
  }
}

export default ComponentTestingHelper;
