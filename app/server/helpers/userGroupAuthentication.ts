// import from dist/helpers to prevent bundling all the @bcgov-cas/sso-express dependencies
import { isAuthenticated } from "@bcgov-cas/sso-express/dist/helpers";
import type { Request } from "express";
import * as groupConstants from "../../data/group-constants";
import { compactGroups } from "../../lib/userGroups";
import config from "../../config";

const removeLeadingSlash = (str: string) =>
  str[0] === "/" ? str.slice(1) : str;

export const getUserGroups = (req: Request) => {
  if (
    config.get("enableMockAuth") &&
    req.cookies?.[config.get("mockAuthCookie")]
  ) {
    return [req.cookies?.[config.get("mockAuthCookie")]];
  }
  if (!isAuthenticated(req)) return [];

  const groups = (req.claims.groups || []) as string[];

  const processedGroups = groups.map((value) => removeLeadingSlash(value));
  const validGroups = compactGroups(processedGroups);

  if (validGroups.length === 0) {
    // When we will have other identity providers, we can check it the identity_provider claim
    // return req.claims.identity_provider === "idir"
    //   ? [groupConstants.UNAUTHORIZED_IDIR_USER]
    //   : [groupConstants.NON_IDIR_USER];
    return [groupConstants.UNAUTHORIZED_IDIR_USER];
  }

  return validGroups;
};
