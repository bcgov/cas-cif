import { getUserGroupLandingRoute } from "../../lib/userGroups";
import { getUserGroups } from "../helpers/userGroupAuthentication";
import createUserMiddleware from "./createUser";
import ssoExpress from "@bcgov-cas/sso-express";
import config from "../../config";

const mockLogin =
  config.get("cifRole") === "CIF_ADMIN" ||
  config.get("cifRole") === "CIF_INTERNAL";
const mockSessionTimeout = mockLogin || config.get("enableMockAuth");

let ssoServerHost;
if (!config.get("namespace") || config.get("namespace").endsWith("-dev"))
  ssoServerHost = "dev.oidc.gov.bc.ca";
else if (config.get("namespace").endsWith("-test"))
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
      baseUrl: config.get("host"),
      clientId: "cas-cif",
      oidcIssuer: `https://${ssoServerHost}/auth/realms/pisrwwhx`,
    },
    ...(!config.get("showKCLogin") && {
      authorizationUrlParams: { kc_idp_hint: "idir" },
    }),
    onAuthCallback: createUserMiddleware(),
  });
}
