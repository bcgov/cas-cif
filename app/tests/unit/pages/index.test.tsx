/**
 * @jest-environment node
 */

import { getUserGroups } from "server/helpers/userGroupAuthentication";
import { withRelayOptions } from "pages";
jest.mock("server/helpers/userGroupAuthentication");
jest.mock("lib/relay/server");

describe("The index page", () => {
  it("redirects a logged in cif_admin to the /admin route", async () => {
    getUserGroups.mockReturnValue(["cif_admin"]);
    const ctx = {
      req: {
        url: "/",
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({
      redirect: { destination: "/admin" },
    });
  });

  it("redirects a logged in cif_internal to the /cif route", async () => {
    getUserGroups.mockReturnValue(["cif_internal"]);
    const ctx = {
      req: {
        url: "/",
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({
      redirect: { destination: "/cif" },
    });
  });

  it("does not redirect a logged out user", async () => {
    getUserGroups.mockReturnValue([]);
    const ctx = {
      req: {
        url: "/",
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({});
  });
});
