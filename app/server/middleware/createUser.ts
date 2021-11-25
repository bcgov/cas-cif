import type { Request, Response, NextFunction } from "express";

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

const createUserMiddleware = (host: string, port: number) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const fetchOptions = {
      method: "POST",
      body: JSON.stringify({
        query: createUserMutation,
        variables: null,
      }),
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie,
      },
    };

    const response = await fetch(
      `http://${host}:${port}/graphql`,
      fetchOptions
    );

    if (!response?.ok) {
      throw new Error(
        `Failed to create user from session: ${response.statusText}`
      );
    }

    next();
  };
};

export default createUserMiddleware;
