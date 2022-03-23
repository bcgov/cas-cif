import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { render, screen } from "@testing-library/react";
import { loadQuery, RelayEnvironmentProvider } from "react-relay";
import compiledOperatorViewQuery, {
  OperatorViewQuery,
  OperatorViewQuery$variables,
} from "__generated__/OperatorViewQuery.graphql";
import { OperatorViewPage } from "pages/cif/operator/[operator]";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

jest.mock("next/router");
let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
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
    };
  },
};

const loadOperatorQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: OperatorViewQuery$variables = {
    operator: "mock-operator-id",
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(compiledOperatorViewQuery, variables);
  initialQueryRef = loadQuery<OperatorViewQuery>(
    environment,
    compiledOperatorViewQuery,
    variables
  );
};

const renderOperatorPage = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <OperatorViewPage CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("OperatorViewPage", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    jest.restoreAllMocks();
  });

  it("displays the operator data", () => {
    loadOperatorQuery();
    renderOperatorPage();

    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Legal Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Trade Name")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("doesn't display swrs data if there is no swrs operator ID", () => {
    loadOperatorQuery({
      Operator() {
        return {
          id: "mock-cif-operator-id",
          rowId: 43,
          legalName: "Operator Legal Name",
          tradeName: "Operator Trade Name",
          swrsLegalName: "SWRS Legal Name",
          swrsTradeName: "SWRS Trade Name",
          operatorCode: "ABCZ",
          swrsOrganisationId: null,
        };
      },
    });
    renderOperatorPage();

    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.queryByText("SWRS Legal Name")).not.toBeInTheDocument();
    expect(screen.queryByText("SWRS Trade Name")).not.toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("renders a resume edit button when the operator already has a pending form change", () => {
    loadOperatorQuery();
    renderOperatorPage();

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });

  it("renders null if the operator doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );
    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
    loadOperatorQuery({
      Query() {
        return {
          operator: null,
        };
      },
    });
    const { container } = renderOperatorPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining(null));
  });
});
