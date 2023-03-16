import SubHeader from "components/Layout/SubHeader";
import { render, screen, cleanup } from "@testing-library/react";
import { mocked } from "jest-mock";
import dashboardLinks from "../../../../data/dashboardLinks/subHeaderLinks";
import externalLinks from "../../../../data/externalLinks/subHeaderLinks";
import { useRouter } from "next/router";

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("The SubHeader Component", () => {
  it("Renders the home link for internal users", () => {
    mocked(useRouter).mockReturnValue({ asPath: "/", pathname: "/" } as any);
    render(<SubHeader links={dashboardLinks} />);
    expect(screen.getByText("Home").closest("a")).toHaveAttribute(
      "href",
      "/cif"
    );
  });

  it("Highlights the correct link depending on the current page", () => {
    mocked(useRouter).mockReturnValue({ asPath: "/", pathname: "/" } as any);
    render(<SubHeader links={dashboardLinks} />);

    expect(screen.getByText("Home").closest("a")).toHaveStyle(
      "text-decoration: underline;"
    );
    expect(screen.getByText("Projects").closest("a")).not.toHaveStyle(
      "text-decoration: underline;"
    );

    cleanup();
    mocked(useRouter).mockReturnValue({
      asPath: "/cif/project/some-other-page",
      pathname: "/",
    } as any);
    render(<SubHeader links={dashboardLinks} />);

    expect(screen.getByText("Home").closest("a")).not.toHaveStyle(
      "text-decoration: underline;"
    );
    expect(screen.getByText("Projects").closest("a")).toHaveStyle(
      "text-decoration: underline;"
    );
  });

  it("Renders the home link for the external facing subheader", () => {
    mocked(useRouter).mockReturnValue({
      asPath: "/",
      pathname: "/cif-external",
    } as any);
    render(<SubHeader links={externalLinks} />);
    expect(screen.getByText("Home").closest("a")).toHaveAttribute(
      "href",
      "/cif-external"
    );
  });

  it("Renders the correct subheadings", () => {
    mocked(useRouter).mockReturnValue({ asPath: "/", pathname: "/" } as any);
    render(<SubHeader links={externalLinks} />);
    expect(screen.getByText("Email Us")).toBeVisible();
    expect(screen.getByText("Contact Information")).toBeVisible();
  });
});
