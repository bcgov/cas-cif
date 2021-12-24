/**
 * @jest-environment node
 */

import { getUserGroups } from "server/helpers/userGroupAuthentication";
import { withRelayOptions } from "pages";
import { mocked } from "jest-mock";
jest.mock("server/helpers/userGroupAuthentication");
jest.mock("lib/relay/server");

describe("The index page", () => {
  it("redirects a logged in cif_admin to the /cif route", async () => {
    mocked(getUserGroups).mockReturnValue(["cif_admin"]);
    const ctx = {
      req: {
        url: "/",
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({
      redirect: { destination: "/cif" },
    });
  });

  it("redirects a logged in cif_internal to the /cif route", async () => {
    mocked(getUserGroups).mockReturnValue(["cif_internal"]);
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
    mocked(getUserGroups).mockReturnValue([]);
    const ctx = {
      req: {
        url: "/",
      },
    } as any;
    expect(await withRelayOptions.serverSideProps(ctx)).toEqual({});
  });
});
