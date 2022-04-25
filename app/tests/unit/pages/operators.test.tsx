import "@testing-library/jest-dom";
import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledOperatorsQuery, {
  operatorsQuery,
} from "__generated__/operatorsQuery.graphql";
import { Operators } from "../../../pages/cif/operators";
jest.mock("next/router");

mocked(useRouter).mockReturnValue({
  route: "/",
  query: {},
  push: jest.fn(),
} as any);

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

const pageTestingHelper = new PageTestingHelper<operatorsQuery>({
  pageComponent: Operators,
  compiledQuery: compiledOperatorsQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    legalName: null,
    tradeName: null,
    bcRegistryId: null,
    operatorCode: null,
    offset: null,
    pageSize: DEFAULT_PAGE_SIZE,
    orderBy: null,
  },
});

describe("The operators page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("renders the list of operators", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Operator 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Operator 2/i)).toBeInTheDocument();
  });

  it("displays the Add a Operator Button", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Add an Operator/i)).toBeInTheDocument();
  });

  it("displays an error when the Edit button is clicked & createNewOperator mutation fails", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    userEvent.click(screen.getByText(/Add an Operator/i));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to create the operator."
      )
    ).toBeVisible();
  });

  it("displays the Resume Operator Creation button if there is an existing form_change", () => {
    pageTestingHelper.loadQuery({
      Query() {
        return {
          ...defaultMockResolver.Query(),
          pendingNewOperatorFormChange: {
            id: "abcde",
          },
        };
      },
    });
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Resume Operator Creation/i)).toBeInTheDocument();
  });
});
