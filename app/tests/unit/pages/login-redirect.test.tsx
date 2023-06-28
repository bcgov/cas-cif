import { getUserGroups } from "server/helpers/userGroupAuthentication";
import loginRedirect, { withRelayOptions } from "pages/login-redirect";
import { mocked } from "jest-mock";
import { screen } from "@testing-library/react";
import PageTestingHelper from "tests/helpers/pageTestingHelper";
import compiledLoginRedirectQuery, {
  loginRedirectQuery,
} from "__generated__/loginRedirectQuery.graphql";
jest.mock("server/helpers/userGroupAuthentication");
jest.mock("lib/relay/server");

const defaultMockResolver = {
  Query() {
    return {
      session: null,
    };
  },
};

const pageTestingHelper = new PageTestingHelper<loginRedirectQuery>({
  pageComponent: loginRedirect,
  compiledQuery: compiledLoginRedirectQuery,
  defaultQueryResolver: defaultMockResolver,
});

describe("The login-redirect page", () => {
  beforeEach(() => {
    pageTestingHelper.reinit();
  });

  it("redirects a logged in cif_admin to the requested route", async () => {
    mocked(getUserGroups).mockReturnValue(["cif_admin"]);
    const ctx = {
      req: {
        url: `/login-redirect?redirectTo=${encodeURIComponent("/admin/users")}`,
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({
      redirect: { destination: "/admin/users" },
    });
  });

  it("does not redirect a logged out user", async () => {
    mocked(getUserGroups).mockReturnValue([]);
    const ctx = {
      req: {
        url: `/login-redirect?redirectTo=${encodeURIComponent("/admin/users")}`,
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({});
  });

  it("redirects a logged in cif_admin to the index route if the redirectTo query param is missing", async () => {
    mocked(getUserGroups).mockReturnValue(["cif_admin"]);
    const ctx = {
      req: {
        url: `/login-redirect`,
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({
      redirect: { destination: "/" },
    });
  });

  it("renders the login buttons for a logged out user", () => {
    pageTestingHelper.setMockRouterValues({ pathname: "/cif/projects" });
    pageTestingHelper.loadQuery();
    pageTestingHelper.renderPage();

    expect(screen.getByText(/Administrator Login/i)).toBeVisible();
    expect(screen.getByText(/External User Login/i)).toBeVisible();
  });
});
