import { getUserGroupLandingRoute } from "../../lib/userGroups";
import { getUserGroups } from "../helpers/userGroupAuthentication";
import { ENABLE_MOCK_AUTH, AS_CIF_ADMIN, AS_CIF_INTERNAL } from "../args";
import createUserMiddleware from "./createUser";
import ssoExpress from "@bcgov-cas/sso-express";

const mockLogin = AS_CIF_ADMIN || AS_CIF_INTERNAL;
const mockSessionTimeout = mockLogin || ENABLE_MOCK_AUTH;

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
    getRedirectUri: (defaultRedirectUri, req) => {
      const redirectUri = new URL(defaultRedirectUri);
      if (req.query.redirectTo)
        redirectUri.searchParams.append(
          "redirectTo",
          req.query.redirectTo.toString()
        );

      return redirectUri;
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
    ...(process.env.SHOW_KC_LOGIN !== "true" && { authorizationUrlParams: { kc_idp_hint: 'idir' } }),
    onAuthCallback: createUserMiddleware(),
  });
}
