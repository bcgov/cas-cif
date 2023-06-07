import { screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledUnauthorizedIdirQuery, {
  unauthorizedIdirQuery,
} from "__generated__/unauthorizedIdirQuery.graphql";
import unauthorized_idir from "pages/unauthorized_idir";
import getConfig from "next/config";
jest.mock("next/config");

const defaultMockResolver = {
  Query() {
    return {
      session: {
        cifUserBySub: {},
      },
    };
  },
};

const pageTestingHelper = new PageTestingHelper<unauthorizedIdirQuery>({
  pageComponent: unauthorized_idir,
  compiledQuery: compiledUnauthorizedIdirQuery,
  defaultQueryResolver: defaultMockResolver,
});

mocked(getConfig).mockImplementation(() => ({
  publicRuntimeConfig: {
    SUPPORT_EMAIL: "test@email.com",
  },
}));

describe("The unauthorized_idir page", () => {
  it("renders the unauthorized_idir page", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(
      screen.getByRole("heading", {
        name: /welcome to the cif application/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /hi there! your idir needs to be granted access to use the application\. you can contact the administrator at or reach out via the channel on microsoft teams to request access\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: /test@email.com/i,
      })
    ).toHaveAttribute("href", "mailto:test@email.com");
    expect(
      screen.getByRole("button", {
        name: /email us/i,
      })
    ).toBeInTheDocument();
  });

  it("should render the Navigation component without subheader links", () => {
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();
    expect(screen.getByText(/Access required/i)).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });
});
