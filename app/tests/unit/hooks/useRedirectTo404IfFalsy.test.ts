import useRedirectTo404IfFalsy from "hooks/useRedirectTo404IfFalsy";
import { renderHook } from "@testing-library/react-hooks";
import { useRouter } from "next/router";
import { mocked } from "jest-mock";
jest.mock("next/router");
mocked(useRouter).mockReturnValue({
  replace: jest.fn(),
} as any);

describe("the useRedirectTo404IfFalsy hook", () => {
  it("returns true if the record doesn't exist and the page should redirect", () => {
    const { result } = renderHook(() => useRedirectTo404IfFalsy(null));
    expect(result.current).toBe(true);
  });

  it("returns false if the record exists", () => {
    const { result } = renderHook(() => useRedirectTo404IfFalsy(true));
    expect(result.current).toBe(false);
  });
});
