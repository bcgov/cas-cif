import { isRouteAuthorized } from "lib/authorization";

describe("The isRouteAuthorized function", () => {
  it("allows cif_admin to access any route under the /admin route", () => {
    expect(isRouteAuthorized("/admin/users", ["cif_admin"])).toBe(true);
    expect(isRouteAuthorized("/admin/some/other/route", ["cif_admin"])).toBe(
      true
    );
  });

  it("does not allow unauthenticated users to access the /cif route", () => {
    expect(isRouteAuthorized("/cif", ["cif_guest"])).toBe(false);
    expect(isRouteAuthorized("/cif", [])).toBe(false);
  });

  it("does not allow routes that are not specified in pagesAuthorization.json", () => {
    expect(isRouteAuthorized("/some/other/route", ["cif_admin"])).toBe(false);
  });

  it("allows unauthenticated users to access the / route", () => {
    expect(isRouteAuthorized("/", ["cif_guest"])).toBe(true);
    expect(isRouteAuthorized("/", [])).toBe(true);
  });

  it("allows unauthenticated users to access the /login-redirect route", () => {
    expect(isRouteAuthorized("/login-redirect", ["cif_guest"])).toBe(true);
    expect(isRouteAuthorized("/login-redirect", [])).toBe(true);
    expect(
      isRouteAuthorized(
        `/login-redirect?redirectTo=${encodeURIComponent("/some/page")}`,
        ["cif_guest"]
      )
    ).toBe(true);
    expect(
      isRouteAuthorized(
        `/login-redirect?redirectTo=${encodeURIComponent("/some/page")}`,
        []
      )
    ).toBe(true);
  });
});
