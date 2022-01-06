/**
 * @jest-environment node
 */

import withRelayOptions from "lib/relay/withRelayOptions";
import { getUserGroups } from "server/helpers/userGroupAuthentication";
import type { NextPageContext } from "next";
import { mocked } from "jest-mock";

jest.mock("server/helpers/userGroupAuthentication");

describe("The default withRelayOptions", () => {
  describe("serverSideProps", () => {
    it("should redirect a logged out user trying to access a protected page", async () => {
      mocked(getUserGroups).mockReturnValue([]);
      const ctx = {
        req: {
          url: "/cif",
        },
      } as NextPageContext;
      const serverSideProps = await withRelayOptions.serverSideProps(ctx);
      expect(serverSideProps).toEqual({
        redirect: {
          destination: `/login-redirect?redirectTo=${encodeURIComponent(
            "/cif"
          )}`,
        },
      });
    });

    it("should not redirect a cif_admin trying to access the /cif page", async () => {
      mocked(getUserGroups).mockReturnValue(["cif_admin"]);
      const ctx = {
        req: {
          url: "/cif",
        },
      } as NextPageContext;
      const serverSideProps = await withRelayOptions.serverSideProps(ctx);
      expect(serverSideProps).toEqual({});
    });

    it("should not redirect a cif_internal trying to access the /cif page", async () => {
      mocked(getUserGroups).mockReturnValue(["cif_internal"]);
      const ctx = {
        req: {
          url: "/cif",
        },
      } as NextPageContext;
      const serverSideProps = await withRelayOptions.serverSideProps(ctx);
      expect(serverSideProps).toEqual({});
    });

    it("should not redirect a logged in user trying to access a public page", async () => {
      mocked(getUserGroups).mockReturnValue(["cif_internal"]);
      const ctx = {
        req: {
          url: "/",
        },
      } as NextPageContext;
      const serverSideProps = await withRelayOptions.serverSideProps(ctx);
      expect(serverSideProps).toEqual({});
    });
  });
});
