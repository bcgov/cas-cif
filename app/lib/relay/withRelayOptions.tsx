import { getClientEnvironment } from "./client";
import { getUserGroups } from "server/helpers/userGroupAuthentication";
import { getUserGroupLandingRoute } from "lib/userGroups";
import { isRouteAuthorized } from "lib/authorization";

const withRelayOptions = {
  fallback: <div>Loading...</div>,
  createClientEnvironment: () => getClientEnvironment()!,
  createServerEnvironment: async (ctx) => {
    const { createServerEnvironment } = await import("./server");
    return createServerEnvironment({ cookieHeader: ctx.req.headers.cookie });
  },
  serverSideProps: async (ctx) => {
    // Server-side redirection of the user to their landing route, if they are logged in
    const groups = getUserGroups(ctx.req);
    const isAuthorized = isRouteAuthorized(ctx.req.path, groups);

    if (isAuthorized) return {};

    if (groups.length === 0) {
      return {
        redirect: {
          destination: `/login-redirect?redirectTo=${encodeURIComponent(
            ctx.req.path
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
