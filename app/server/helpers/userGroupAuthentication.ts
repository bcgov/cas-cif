import * as groupConstants from "../../data/group-constants";
import { compactGroups } from "../../lib/userGroups";

const removeLeadingSlash = (str: string) =>
  str[0] === "/" ? str.slice(1) : str;

export const getUserGroups = (req) => {
  if (
    !req.kauth ||
    !req.kauth.grant ||
    !req.kauth.grant.id_token ||
    !req.kauth.grant.id_token.content ||
    !req.kauth.grant.id_token.content.groups
  )
    return [];

  const brokerSessionId = req.kauth.grant.id_token.content.broker_session_id;
  const { groups } = req.kauth.grant.id_token.content;

  const processedGroups = groups.map((value) => removeLeadingSlash(value));
  const validGroups = compactGroups(processedGroups);

  if (validGroups.length === 0) {
    return brokerSessionId &&
      brokerSessionId.length === 41 &&
      brokerSessionId.startsWith("idir.")
      ? [groupConstants.UNAUTHORIZED_IDIR_USER]
      : [groupConstants.NON_IDIR_USER];
  }

  return validGroups;
};
