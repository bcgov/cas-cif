import useIsAdmin from "hooks/useIsAdmin";
import { renderHook } from "@testing-library/react";

describe("the useIsAdmin hook", () => {
  it("returns true if the user is a cif_admin", () => {
    const { result } = renderHook(() =>
      useIsAdmin(["some_group", "cif_admin"])
    );
    expect(result.current).toBe(true);
  });

  it("returns true if the user is a realm administrator", () => {
    const { result } = renderHook(() =>
      useIsAdmin(["some_group", "Realm Administrator", "some_other_group"])
    );
    expect(result.current).toBe(true);
  });

  it("returns false otherwise", () => {
    const { result } = renderHook(() =>
      useIsAdmin(["some_group", "some_other_group", "cif_internal"])
    );
    expect(result.current).toBe(false);
  });
});
