import React from "react";
import { Operators, OperatorsQuery } from "../../../pages/cif/operators";
import { render, screen, act } from "@testing-library/react";
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
import userEvent from "@testing-library/user-event";
import { ErrorContext } from "contexts/ErrorContext";
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
      },
      pendingNewOperatorFormChange: null,
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
let errorContext;
const renderOperators = () =>
  render(
    <ErrorContext.Provider value={errorContext}>
      <RelayEnvironmentProvider environment={environment}>
        <Operators CSN preloadedQuery={initialQueryRef} />
      </RelayEnvironmentProvider>
    </ErrorContext.Provider>
  );

describe("The operators page", () => {
  beforeEach(() => {
    environment = createMockEnvironment();
    errorContext = {
      error: null,
      setError: jest.fn().mockImplementation((error) =>
        act(() => {
          errorContext.error = error;
        })
      ),
    };
  });

  it("renders the list of operators", () => {
    loadOperatorsQuery();
    renderOperators();

    expect(screen.getByText(/Operator 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 2/i)).toBeInTheDocument();
  });

  it("displays the Add a Operator Button", () => {
    loadOperatorsQuery();
    renderOperators();

    expect(screen.getByText(/Add an Operator/i)).toBeInTheDocument();
  });

  it("displays an error when the Edit button is clicked & createNewOperator mutation fails", () => {
    loadOperatorsQuery();
    renderOperators();

    userEvent.click(screen.getByText(/Add an Operator/i));
    act(() => {
      environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the operator."
      )
    ).toBeVisible();
  });

  it("displays the Resume Operator Creation button if there is an existing form_change", () => {
    loadOperatorsQuery({
      Query() {
        return {
          ...defaultMockResolver.Query(),
          pendingNewOperatorFormChange: {
            id: "abcde",
          },
        };
      },
    });
    renderOperators();

    expect(screen.getByText(/Resume Operator Creation/i)).toBeInTheDocument();
  });
});
