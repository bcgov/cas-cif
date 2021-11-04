import { getUserGroupLandingRoute } from "../../lib/userGroups";
import { getUserGroups } from "../helpers/userGroupAuthentication";
import ssoUtils from "@bcgov-cas/sso-express";

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

const keycloakConfig = {
  realm: "pisrwwhx",
  "auth-server-url": `https://${ssoServerHost}/auth`,
  "ssl-required": "external",
  resource: "cas-cif",
  "public-client": true,
  "confidential-port": 0,
};

export let keycloak;

export default function middleware(sessionStore) {
  const { ssoMiddleware, keycloak: keycloakObj } = new ssoUtils({
    applicationHost: process.env.HOST,
    applicationDomain: ".gov.bc.ca",
    sessionStore,
    getLandingRoute: (req) => {
      if (req.query.redirectTo) return req.query.redirectTo;

      const groups = getUserGroups(req);

      return getUserGroupLandingRoute(groups);
    },
    bypassAuthentication: {
      login: mockLogin,
      sessionIdleRemainingTime: mockSessionTimeout,
    },
    accessDenied: (_req, res) => res.redirect("/403"),
    keycloakConfig,
  });

  keycloak = keycloakObj;

  return ssoMiddleware;
}
