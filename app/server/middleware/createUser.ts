import type { Request, Response, NextFunction } from "express";
import { performQuery } from "./graphql";
// This middleware calls the createUserFromSession mutation.
// The request to that mutation is made with the current session
// cookies to ensure authentication.

const createUserMutation = `
mutation {
  createUserFromSession(input: {}) {
    __typename
  }
}
`;

const createUserMiddleware = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const response = await performQuery(createUserMutation, {}, req);

    if (response.errors) {
      throw new Error(
        `Failed to create user from session:\n${response.errors.join("\n")}`
      );
    }

    next();
  };
};

export default createUserMiddleware;
