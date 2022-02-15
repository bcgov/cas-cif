import type { Request } from "express";
import { getUserGroups } from "../helpers/userGroupAuthentication";
import { performQuery } from "./graphql";
import { UNAUTHORIZED_IDIR_USER } from "../../data/group-constants";

// This middleware calls the createUserFromSession mutation.

const createUserMutation = `
mutation {
  createUserFromSession(input: {}) {
    __typename
  }
}
`;

const createUserMiddleware = () => {
  return async (req: Request) => {
    if (getUserGroups(req).includes(UNAUTHORIZED_IDIR_USER)) {
      return;
    }

    const response = await performQuery(createUserMutation, {}, req);

    if (response.errors) {
      throw new Error(
        `Failed to create user from session:\n${response.errors.join("\n")}`
      );
    }
  };
};

export default createUserMiddleware;
