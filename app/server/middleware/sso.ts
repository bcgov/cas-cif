import { getUserGroupLandingRoute } from "../../lib/userGroups";
import { getUserGroups } from "../helpers/userGroupAuthentication";
import ssoExpress from "@bcgov-cas/sso-express";

const AS_REPORTER = process.argv.includes("AS_REPORTER");
const AS_ADMIN = process.argv.includes("AS_ADMIN");
const AS_CYPRESS = process.argv.includes("AS_CYPRESS");

const mockLogin = AS_REPORTER || AS_ADMIN;
const mockSessionTimeout = mockLogin || AS_CYPRESS;

let ssoServerHost;
if (!process.env.NAMESPACE || process.env.NAMESPACE.endsWith("-dev"))
  ssoServerHost = "dev.oidc.gov.bc.ca";
else if (process.env.NAMESPACE.endsWith("-test"))
  ssoServerHost = "test.oidc.gov.bc.ca";
else ssoServerHost = "oidc.gov.bc.ca";

export default async function middleware() {
  return ssoExpress({
    applicationDomain: ".gov.bc.ca",
    getLandingRoute: (req) => {
      if (req.query.redirectTo) return req.query.redirectTo;

      const groups = getUserGroups(req);

      return getUserGroupLandingRoute(groups);
    },
    bypassAuthentication: {
      login: mockLogin,
      sessionIdleRemainingTime: mockSessionTimeout,
    },
    oidcConfig: {
      baseUrl:
        process.env.HOST || `http://localhost:${process.env.PORT || 3004}`,
      clientId: "cas-cif",
      oidcIssuer: `https://${ssoServerHost}/auth/realms/pisrwwhx`,
    },
  });
}
