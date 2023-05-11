import { getProjectRevisionFormPageRoute } from "routes/pageRoutes";

describe("The project revision form route function", () => {
  it("Returns a route url without an anchor", () => {
    const urlUnderTest = getProjectRevisionFormPageRoute("revision", 45);

    expect(urlUnderTest).toStrictEqual({
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        formIndex: 45,
        projectRevision: "revision",
      },
    });
  });

  it("Returns a route url with an anchor when present", () => {
    const urlUnderTest = getProjectRevisionFormPageRoute(
      "another-revision",
      123,
      "test-anchor"
    );

    expect(urlUnderTest).toStrictEqual({
      hash: "test-anchor",
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        formIndex: 123,
        projectRevision: "another-revision",
      },
    });
  });

  it("Returns an internal route url by default", () => {
    const urlUnderTest = getProjectRevisionFormPageRoute(
      "another-revision",
      123,
      "test-anchor"
    );

    expect(urlUnderTest).toStrictEqual({
      hash: "test-anchor",
      pathname: "/cif/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        formIndex: 123,
        projectRevision: "another-revision",
      },
    });
  });

  it("Returns an external route url when isInternal prop is false", () => {
    const urlUnderTest = getProjectRevisionFormPageRoute(
      "another-revision",
      123,
      undefined,
      false
    );

    expect(urlUnderTest).toStrictEqual({
      pathname:
        "/cif-external/project-revision/[projectRevision]/form/[formIndex]",
      query: {
        formIndex: 123,
        projectRevision: "another-revision",
      },
    });
  });
});
