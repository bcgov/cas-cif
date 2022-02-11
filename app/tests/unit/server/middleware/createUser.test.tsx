/**
 * @jest-environment node
 */

import createUserMiddleware from "server/middleware/createUser";

describe("The create user middleware", () => {
  it("calls the local graphql endpoint with a createUserFromSession mutation and the request cookies", async () => {
    const performQuery = jest
      .spyOn(require("server/middleware/graphql"), "performQuery")
      .mockImplementation(() => {
        return {
          data: {
            createUserFromSession: {
              __typename: "CreateUserFromSessionPayload",
            },
          },
        };
      });

    const middlewareUnderTest = createUserMiddleware();

    const req = { claims: { sub: "1234" } } as any;
    await middlewareUnderTest(req, null, jest.fn());

    expect(performQuery).toHaveBeenCalledWith(
      expect.stringContaining("createUserFromSession(input: {})"),

      {},
      req
    );
  });

  it("does not break the middleware chain", async () => {
    const middlewareUnderTest = createUserMiddleware();

    const next = jest.fn();

    await middlewareUnderTest({ headers: { cookie: "" } } as any, null, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws on error", async () => {
    jest
      .spyOn(require("server/middleware/graphql"), "performQuery")
      .mockImplementation(() => {
        return {
          errors: [{ message: "error" }],
          data: {
            createUserFromSession: {
              __typename: "CreateUserFromSessionPayload",
            },
          },
        };
      });

    const middlewareUnderTest = createUserMiddleware();

    await expect(async () => {
      await middlewareUnderTest({ claims: {} } as any, null, jest.fn());
    }).rejects.toThrow("Failed to create user from session:");
  });
});
