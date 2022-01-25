import React from "react";
import { Operators, OperatorsQuery } from "../../../pages/cif/operators";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import {
  createMockEnvironment,
  MockPayloadGenerator,
  RelayMockEnvironment,
} from "relay-test-utils";
import { RelayEnvironmentProvider, loadQuery } from "react-relay";
import {
  operatorsQuery,
  operatorsQuery$variables,
} from "__generated__/operatorsQuery.graphql";
import { MockResolvers } from "relay-test-utils/lib/RelayMockPayloadGenerator";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

let environment: RelayMockEnvironment;
let initialQueryRef;

const defaultMockResolver = {
  Query() {
    return {
      session: { cifUserBySub: {} },
      allOperators: {
        totalCount: 2,
        edges: [
          { node: { id: "1", legalName: "Operator 1" } },
          { node: { id: "2", legalName: "Operator 2" } },
        ],
      }
    };
  },
};

const loadOperatorsQuery = (
  mockResolver: MockResolvers = defaultMockResolver
) => {
  const variables: operatorsQuery$variables = {
    legalName: null,
    tradeName: null,
    bcRegistryId: null,
    operatorCode: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
  };

  environment.mock.queueOperationResolver((operation) => {
    return MockPayloadGenerator.generate(operation, mockResolver);
  });

  environment.mock.queuePendingOperation(OperatorsQuery, variables);
  initialQueryRef = loadQuery<operatorsQuery>(
    environment,
    OperatorsQuery,
    variables
  );
};

const renderOperators = () =>
  render(
    <RelayEnvironmentProvider environment={environment}>
      <Operators CSN preloadedQuery={initialQueryRef} />
    </RelayEnvironmentProvider>
  );

describe("The operators page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it("renders the list of operators", () => {
    loadOperatorsQuery();
    renderOperators();

    expect(screen.getByText(/Operator 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 2/i)).toBeInTheDocument();
  });

  it("loads the Add a Operator Button", () => {
    loadOperatorsQuery();
    renderOperators();

    expect(screen.getByText(/Add an Operator/i)).toBeInTheDocument();
  });
});
