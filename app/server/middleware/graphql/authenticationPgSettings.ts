import { getPriorityGroup } from "../../../lib/userGroups";
import { getUserGroups } from "../../helpers/userGroupAuthentication";
import groupData from "../../../data/groups.json";
import { isAuthenticated } from "@bcgov-cas/sso-express";
import type { Request } from "express";

const AUTH_BYPASS_COOKIE = "mocks.auth";

const AS_CIF_INTERNAL = process.argv.includes("AS_CIF_INTERNAL");

const AS_CIF_EXTERNAL = process.argv.includes("AS_CIF_EXTERNAL");

const AS_CIF_ADMIN = process.argv.includes("AS_CIF_ADMIN");

const AS_UNAUTHORIZED_IDIR = process.argv.includes("AS_UNAUTHORIZED_IDIR");
const AS_CYPRESS = process.argv.includes("AS_CYPRESS");

const allowCypressForRole = (roleName: string, req: Request) => {
  return AS_CYPRESS && req.cookies[AUTH_BYPASS_COOKIE] === roleName;
};

const authenticationPgSettings = (req: Request) => {
  if (AS_CIF_INTERNAL || allowCypressForRole("cif_internal", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000000",
      "jwt.claims.user_groups": "cif_internal",
      "jwt.claims.priority_group": "cif_internal",
      role: "cif_internal",
    };
  }

  if (AS_CIF_EXTERNAL || allowCypressForRole("cif_external", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000001",
      "jwt.claims.user_groups": "cif_external",
      "jwt.claims.priority_group": "cif_external",
      role: "cif_external",
    };
  }

  if (AS_CIF_ADMIN || allowCypressForRole("cif_admin", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000002",
      "jwt.claims.user_groups": "cif_admin",
      "jwt.claims.priority_group": "cif_admin",
      role: "cif_admin",
    };
  }

  if (AS_UNAUTHORIZED_IDIR || allowCypressForRole("unauthorized_idir", req)) {
    return {
      "jwt.claims.sub": "00000000-0000-0000-0000-000000000000",
      "jwt.claims.user_groups": "UNAUTHORIZED_IDIR",
      "jwt.claims.priority_group": "UNAUTHORIZED_IDIR",
      role: "ciip_guest",
    };
  }

  const groups = getUserGroups(req);
  const priorityGroup = getPriorityGroup(groups);

  const claimsSettings = {
    role: groupData[priorityGroup].pgRole,
  };
  if (!isAuthenticated(req))
    return {
      ...claimsSettings,
    };

  const claims = req.claims;

  claims.user_groups = groups.join(",");
  claims.priority_group = priorityGroup;

  const properties = [
    "jti",
    "exp",
    "nbf",
    "iat",
    "iss",
    "aud",
    "sub",
    "typ",
    "azp",
    "auth_time",
    "session_state",
    "acr",
    "email_verified",
    "name",
    "preferred_username",
    "given_name",
    "family_name",
    "email",
    "broker_session_id",
    "user_groups",
    "priority_group",
  ];
  properties.forEach((property) => {
    claimsSettings[`jwt.claims.${property}`] = claims[property];
  });

  return {
    ...claimsSettings,
  };
};

export default authenticationPgSettings;
