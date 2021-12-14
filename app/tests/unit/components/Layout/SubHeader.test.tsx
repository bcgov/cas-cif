import SubHeader from "components/Layout/SubHeader";
import { useRouter } from "next/router";
import { render, screen, cleanup } from "@testing-library/react";
import { mocked } from "jest-mock";
jest.mock("next/router");

describe("The SubHeader Component", () => {
  it("Changes the dashboard link depending on the isAdmin prop", () => {
    mocked(useRouter).mockReturnValue({ asPath: "/" } as any);
    render(<SubHeader isAdmin={true} />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/admin"
    );
    cleanup();
    render(<SubHeader isAdmin={false} />);
    expect(screen.getByText("Dashboard").closest("a")).toHaveAttribute(
      "href",
      "/cif"
    );
  });

  it("Highlights the correct link depending on the current page", () => {
    mocked(useRouter).mockReturnValue({ asPath: "/" } as any);
    render(<SubHeader />);

    expect(screen.getByText("Dashboard").closest("a")).toHaveStyle(
      "text-decoration: underline;"
    );
    expect(screen.getByText("Projects").closest("a")).not.toHaveStyle(
      "text-decoration: underline;"
    );

    cleanup();
    mocked(useRouter).mockReturnValue({
      asPath: "/cif/project/some-other-page",
    } as any);
    render(<SubHeader />);

    expect(screen.getByText("Dashboard").closest("a")).not.toHaveStyle(
      "text-decoration: underline;"
    );
    expect(screen.getByText("Projects").closest("a")).toHaveStyle(
      "text-decoration: underline;"
    );
  });
});
