import { isRouteAuthorized } from "lib/authorization";

describe("The isRouteAuthorized function", () => {
  it("allows cif_admin to access the /admin route", () => {
    expect(isRouteAuthorized("/admin", ["cif_admin"])).toBe(true);
  });

  it("allows cif_admin to access any route under the /admin route", () => {
    expect(isRouteAuthorized("/admin/users", ["cif_admin"])).toBe(true);
    expect(isRouteAuthorized("/admin/some/other/route", ["cif_admin"])).toBe(
      true
    );
  });

  it("does not allow cif_internal users to access the /admin route", () => {
    expect(isRouteAuthorized("/admin", ["cif_internal"])).toBe(false);
  });

  it("does not allow unauthenticated users to access the /admin route", () => {
    expect(isRouteAuthorized("/admin", ["cif_guest"])).toBe(false);
    expect(isRouteAuthorized("/admin", [])).toBe(false);
  });

  it("does not allow routes that are not specified in pagesAuthorization.json", () => {
    expect(isRouteAuthorized("/some/other/route", ["cif_admin"])).toBe(false);
  });

  it("allows unauthenticated users to access the / route", () => {
    expect(isRouteAuthorized("/", ["cif_guest"])).toBe(true);
    expect(isRouteAuthorized("/", [])).toBe(true);
  });
});
