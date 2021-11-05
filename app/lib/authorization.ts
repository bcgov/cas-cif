import pagesAuthorization from "../data/pagesAuthorization.json";
import { match } from "path-to-regexp";

export const isRouteAuthorized = (
  route: string,
  userGroups: readonly string[]
) => {
  const authRules = pagesAuthorization.find(({ routePaths }) =>
    routePaths.some((routePath) =>
      match(routePath, { decode: decodeURIComponent, endsWith: "?" })(route)
    )
  );

  if (!authRules) {
    return false;
  }

  const { isProtected, allowedRoles = [] } = authRules;

  if (!isProtected) {
    return true;
  }

  return allowedRoles.some((role) => userGroups.includes(role));
};
