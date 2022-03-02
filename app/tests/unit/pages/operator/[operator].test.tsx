import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import compiledOperatorViewQuery, {
  OperatorViewQuery,
} from "__generated__/OperatorViewQuery.graphql";
import { OperatorViewPage } from "pages/cif/operator/[operator]";

let environment;

const loadOperatorData = (additionalOperatorData = {}) => {
  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, {
      Operator() {
        return {
          id: "mock-cif-operator-id",
          rowId: 43,
          legalName: "Operator Legal Name",
          tradeName: "Operator Trade Name",
          swrsLegalName: "SWRS Legal Name",
          swrsTradeName: "SWRS Trade Name",
          operatorCode: "ABCZ",
          swrsOrganisationId: "12345",
          ...additionalOperatorData,
        };
      },
    });
  });

  const variables = {
    operator: "mock-operator-id",
  };
  environment.mock.queuePendingOperation(compiledOperatorViewQuery, variables);
  return loadQuery<OperatorViewQuery>(
    environment,
    compiledOperatorViewQuery,
    variables
  );
};

describe("OperatorViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("displays the operator data", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <OperatorViewPage CSN preloadedQuery={loadOperatorData()} />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Legal Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Trade Name")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("doesn't display swrs data if there is no swrs operator ID", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <OperatorViewPage
          CSN
          preloadedQuery={loadOperatorData({ swrsOrganisationId: null })}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.queryByText("SWRS Legal Name")).not.toBeInTheDocument();
    expect(screen.queryByText("SWRS Trade Name")).not.toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("renders a resume edit button when the operator already has a pending form change", () => {
    render(
      <RelayEnvironmentProvider environment={environment}>
        <OperatorViewPage
          CSN
          preloadedQuery={loadOperatorData({
            pendingFormChange: {
              id: "mock-form-change-id",
            },
          })}
        />
      </RelayEnvironmentProvider>
    );

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });
});
