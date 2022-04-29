import { getClientEnvironment } from "./client";
import { getUserGroupLandingRoute } from "lib/userGroups";
import { isRouteAuthorized } from "lib/authorization";
import type { NextPageContext } from "next";
import type { Request } from "express";
import { WiredOptions } from "relay-nextjs/wired/component";
import { NextRouter } from "next/router";
import safeJsonParse from "lib/safeJsonParse";
import { DEFAULT_PAGE_SIZE } from "components/Table/Pagination";
import LoadingFallback from "components/Layout/LoadingFallback";
import * as Sentry from "@sentry/react";
import Error from "components/Error";

const withRelayOptions: WiredOptions<any> = {
  fallback: <LoadingFallback />,
  ErrorComponent: () => (
    <Sentry.ErrorBoundary
      fallback={<Error />}
      onError={() => {
        console.log("is this onerror function called");
      }}
    />
  ),
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
  variablesFromContext: (ctx: NextPageContext | NextRouter) => {
    const filterArgs = safeJsonParse(ctx.query.filterArgs as string);
    const pageArgs = safeJsonParse(ctx.query.pageArgs as string);
    return {
      ...ctx.query,
      ...filterArgs,
      pageSize: DEFAULT_PAGE_SIZE,
      ...pageArgs,
    };
  },
};

export default withRelayOptions;
