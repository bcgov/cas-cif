/**
 * @jest-environment node
 */

import withRelayOptions from "lib/relay/withRelayOptions";
import { getUserGroups } from "server/helpers/userGroupAuthentication";
import type { NextPageContext } from "next";
import { mocked } from "jest-mock";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";

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

  describe("The relay variables", () => {
    it("should include the query string attributes", () => {
      const variables = withRelayOptions.variablesFromContext({
        query: {
          foo: "bar",
          baz: "qux",
        },
      } as any);

      expect(variables).toEqual(
        expect.objectContaining({
          foo: "bar",
          baz: "qux",
        })
      );
    });

    it("should include the parsed filterArgs from the query string attributes", () => {
      const variables = withRelayOptions.variablesFromContext({
        query: {
          filterArgs: JSON.stringify({
            foo: "bar",
            baz: "qux",
          }),
        },
      } as any);

      expect(variables).toEqual(
        expect.objectContaining({
          foo: "bar",
          baz: "qux",
        })
      );
    });
    it("should include the parsed pageArgs from the query string attributes", () => {
      const variables = withRelayOptions.variablesFromContext({
        query: {
          pageArgs: JSON.stringify({
            pageSize: 42,
            offset: 12,
          }),
        },
      } as any);

      expect(variables).toEqual(
        expect.objectContaining({
          pageSize: 42,
          offset: 12,
        })
      );
    });

    it("should include the default pageSize if not specified in pageArgs", () => {
      const variables = withRelayOptions.variablesFromContext({
        query: {},
      } as any);

      expect(variables).toEqual(
        expect.objectContaining({
          pageSize: DEFAULT_PAGE_SIZE,
        })
      );
    });
  });
});
