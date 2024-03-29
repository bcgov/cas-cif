import { renderHook } from "@testing-library/react";
import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));
mocked(useRouter).mockReturnValue({
  replace: jest.fn(),
} as any);

describe("the useRedirectTo404IfFalsy hook", () => {
  it("returns true if the record doesn't exist and the page should redirect", () => {
    const { result } = renderHook(() => useRedirectTo404IfFalsy(null));
    expect(result.current).toBe(true);
    expect(useRouter().replace).toHaveBeenCalledWith("/404");
  });

  it("returns false if the record exists", () => {
    const { result } = renderHook(() => useRedirectTo404IfFalsy(true));
    expect(result.current).toBe(false);
  });
});
