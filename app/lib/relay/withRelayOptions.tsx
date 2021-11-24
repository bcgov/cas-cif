import { getClientEnvironment } from "./client";
import { getUserGroupLandingRoute } from "lib/userGroups";
import { isRouteAuthorized } from "lib/authorization";
import type { NextPageContext } from "next";
import type { Request } from "express";
import { WiredOptions } from "relay-nextjs/wired/component";

const withRelayOptions: WiredOptions<any> = {
  fallback: <div>Loading...</div>,
  createClientEnvironment: () => getClientEnvironment()!,
  createServerEnvironment: async (ctx: NextPageContext) => {
    const { createServerEnvironment } = await import("./server");
    return createServerEnvironment({ cookieHeader: ctx.req.headers.cookie });
  },
  serverSideProps: async (ctx: NextPageContext) => {
    // Server-side redirection of the user to their landing route, if they are logged in
    const { getUserGroups } = await import(
      "server/helpers/userGroupAuthentication"
    );

    const groups = getUserGroups(ctx.req as Request);
    const isAuthorized = isRouteAuthorized(ctx.req.url, groups);

    if (isAuthorized) return {};

    if (groups.length === 0) {
      return {
        redirect: {
          destination: `/login-redirect?redirectTo=${encodeURIComponent(
            ctx.req.url
          )}`,
        },
      };
    }
    const landingRoute = getUserGroupLandingRoute(groups);

    return {
      redirect: { destination: landingRoute, permanent: false },
    };
  },
};

export default withRelayOptions;
