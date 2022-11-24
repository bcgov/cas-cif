/**
 * @jest-environment node
 */

import { UNAUTHORIZED_IDIR_USER } from "data/group-constants";
import createUserMiddleware from "server/middleware/createUser";

describe("The create user middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("calls the local graphql endpoint with a createUserFromSession mutation and the session data", async () => {
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
    await middlewareUnderTest(req);

    expect(performQuery).toHaveBeenCalledWith(
      expect.stringContaining("updateOrCreateUserFromSession(input: {})"),

      {},
      req
    );
  });

  it("does not call the local graphql endpoint if the user is not authorized", async () => {
    const performQuery = jest.spyOn(
      require("server/middleware/graphql"),
      "performQuery"
    );

    jest
      .spyOn(require("server/helpers/userGroupAuthentication"), "getUserGroups")
      .mockImplementationOnce(() => {
        return [UNAUTHORIZED_IDIR_USER];
      });

    const middlewareUnderTest = createUserMiddleware();

    const req = { claims: { sub: "1234" } } as any;
    await middlewareUnderTest(req);

    expect(performQuery).not.toHaveBeenCalled();
  });

  it("throws on error", async () => {
    jest
      .spyOn(require("server/middleware/graphql"), "performQuery")
      .mockImplementation(() => {
        return {
          errors: [{ message: "error" }],
          data: {
            createUserFromSession: {
              __typename: "UpdateOrCreateUserFromSessionPayload",
            },
          },
        };
      });

    const middlewareUnderTest = createUserMiddleware();

    await expect(async () => {
      await middlewareUnderTest({ claims: {} } as any);
    }).rejects.toThrow("Failed to update or create user from session:");
  });
});
