import createUserMiddleware from "server/middleware/createUser";

global.fetch = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ ok: true }));

beforeEach(() => {
  fetch.mockClear();
});

describe("The create user middleware", () => {
  it("calls the local graphql endpoint with a createUserFromSession mutation and the request cookies", async () => {
    const middlewareUnderTest = createUserMiddleware(
      "somehost.example.com",
      123987
    );

    await middlewareUnderTest(
      { headers: { cookie: "testsessioncookie" } } as any,
      null,
      jest.fn()
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "http://somehost.example.com:123987/graphql",
      {
        body: '{"query":"\\nmutation {\\n  createUserFromSession(input: {}) {\\n    __typename\\n  }\\n}\\n","variables":null}',
        headers: {
          "Content-Type": "application/json",
          cookie: "testsessioncookie",
        },
        method: "POST",
      }
    );
  });

  it("does not break the middleware chain", async () => {
    const middlewareUnderTest = createUserMiddleware(
      "somehost.example.com",
      123987
    );

    const next = jest.fn();

    await middlewareUnderTest({ headers: { cookie: "" } } as any, null, next);

    expect(next).toHaveBeenCalled();
  });

  it("throws on network error", async () => {
    global.fetch = jest.fn().mockImplementation(() => {
      throw new Error("Network Error");
    });

    const middlewareUnderTest = createUserMiddleware("a", 1);

    await expect(async () => {
      await middlewareUnderTest(
        { headers: { cookie: "acookie" } } as any,
        null,
        jest.fn()
      );
    }).rejects.toThrow("Network Error");
  });

  it("throws on http error", async () => {
    fetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 599,
        statusText: "Bad Test Server Error",
      })
    );

    const middlewareUnderTest = createUserMiddleware("a", 1);

    await expect(async () => {
      await middlewareUnderTest(
        { headers: { cookie: "acookie" } } as any,
        null,
        jest.fn()
      );
    }).rejects.toThrow(
      "Failed to create user from session: Bad Test Server Error"
    );
  });
});
