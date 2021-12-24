/**
 * @jest-environment node
 */

import { getUserGroups } from "server/helpers/userGroupAuthentication";
import { withRelayOptions } from "pages/login-redirect";
import { mocked } from "jest-mock";
jest.mock("server/helpers/userGroupAuthentication");
jest.mock("lib/relay/server");

describe("The login-redirect page", () => {
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
});
