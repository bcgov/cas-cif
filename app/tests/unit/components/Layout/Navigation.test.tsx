import Navigation from "components/Layout/Navigation";
import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import { useRouter } from "next/router";

const links = [
  {
    name: "Projects",
    href: {
      pathname: "/cif/projects/",
    },
    highlightOn: ["/cif/project(.*)"],
  },
];

const linksHomepage = [
  {
    name: "Homepage",
    href: {
      pathname: "/",
    },
    highlightOn: ["/(.*)"],
  },
];

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("The Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocked(useRouter).mockReturnValue({
      pathname: "/",
    } as any);
  });
  it("should not render the subheader links if the user is logged out", () => {
    render(<Navigation isLoggedIn={false} links={links} />);
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should not render the subheader links if the user is logged in but their IDIR is unauthorized", () => {
    render(
      <Navigation isLoggedIn={true} links={links} title="Access required" />
    );

    expect(screen.getByText(/Access required/i)).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should render the subheader links if the user is logged in and their IDIR is authorized", () => {
    render(<Navigation isLoggedIn={true} links={links} />);

    expect(screen.getByText("Home")).toBeVisible();
    expect(screen.getByText("Projects")).toBeVisible();
  });

  it("should not render the login buttons if the user is logged in", () => {
    render(<Navigation isLoggedIn={true} links={links} />);

    expect(screen.queryByText("Administrator Login")).toBeNull();
    expect(screen.queryByText("External User Login")).toBeNull();
  });

  it("should not render the login buttons if the user is logged out but on the homepage", () => {
    render(<Navigation isLoggedIn={false} links={linksHomepage} />);

    expect(screen.queryByText("Administrator Login")).toBeNull();
    expect(screen.queryByText("External User Login")).toBeNull();
  });
});
