import { Request, Response } from "express";
import { isRouteAuthorized } from "../../lib/authorization";
import { getUserGroupLandingRoute } from "../../lib/userGroups";
import { getUserGroups } from "../helpers/userGroupAuthentication";

export default function authorizationMiddleware() {
  return (req: Request, res: Response, next) => {
    const groups = getUserGroups(req);
    if (req.path.startsWith("/_next") || isRouteAuthorized(req.path, groups)) {
      next();
    } else if (groups.length === 0) {
      res.redirect(
        `/login-redirect?redirectTo=${encodeURIComponent(req.path)}`
      );
    } else {
      res.redirect(getUserGroupLandingRoute(groups));
    }
  };
}
