import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";
import { OperatorViewPage } from "pages/cif/operator/[operator]";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledOperatorViewQuery, {
  OperatorViewQuery,
} from "__generated__/OperatorViewQuery.graphql";

jest.mock("next/router");

const defaultMockResolver = {
  Operator() {
    return {
      id: "mock-cif-operator-id",
      rowId: 43,
      bcRegistryId: "XXX-BC-Registery-ID-XXX",
      legalName: "Operator Legal Name",
      tradeName: "Operator Trade Name",
      swrsLegalName: "SWRS Legal Name",
      swrsTradeName: "SWRS Trade Name",
      operatorCode: "ABCZ",
      swrsOrganisationId: "12345",
    };
  },
};

const pageTestingHelper = new PageTestingHelper<OperatorViewQuery>({
  pageComponent: OperatorViewPage,
  compiledQuery: compiledOperatorViewQuery,
  defaultQueryResolver: defaultMockResolver,
  defaultQueryVariables: {
    operator: "mock-operator-id",
  },
});

describe("OperatorViewPage", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
    jest.restoreAllMocks();
  });

  it("displays the operator data", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText("XXX-BC-Registery-ID-XXX")).toBeInTheDocument();
    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Legal Name")).toBeInTheDocument();
    expect(screen.getByText("SWRS Trade Name")).toBeInTheDocument();
    expect(screen.getByText("Yes")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("doesn't display swrs data if there is no swrs operator ID", () => {
    pageTestingHelper.loadQuery({
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
    pageTestingHelper.renderPage();

    expect(screen.getByText("Operator Legal Name")).toBeInTheDocument();
    expect(screen.getByText("Operator Trade Name")).toBeInTheDocument();
    expect(screen.queryByText("SWRS Legal Name")).not.toBeInTheDocument();
    expect(screen.queryByText("SWRS Trade Name")).not.toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
    expect(screen.getByText("ABCZ")).toBeInTheDocument();
  });

  it("renders a resume edit button when the operator already has a pending form change", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText("Resume Editing")).toBeInTheDocument();
  });

  it("displays an error when the Edit button is clicked & createEditOperator mutation fails", () => {
    pageTestingHelper.loadQuery({
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
          pendingFormChange: null,
        };
      },
    });
    pageTestingHelper.renderPage();
    userEvent.click(screen.getByText(/Edit/i));
    act(() => {
      pageTestingHelper.environment.mock.rejectMostRecentOperation(new Error());
    });
    expect(pageTestingHelper.errorContext.setError).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText(
        "An error occurred while attempting to edit the operator."
      )
    ).toBeVisible();
  });

  it("renders null if the operator doesn't exist", () => {
    const spy = jest.spyOn(
      require("app/hooks/useRedirectTo404IfFalsy"),
      "default"
    );
    mocked(useRouter).mockReturnValue({
      replace: jest.fn(),
    } as any);
    pageTestingHelper.loadQuery({
      Query() {
        return {
          operator: null,
        };
      },
    });
    const { container } = pageTestingHelper.renderPage();
    expect(container.childElementCount).toEqual(0);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining(null));
  });
});
