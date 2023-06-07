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
  {
    name: "Operators",
    href: {
      pathname: "/cif/operators/",
    },
    highlightOn: ["/cif/operator(.*)"],
  },
  {
    name: "Contacts",
    href: {
      pathname: "/cif/contacts/",
    },
    highlightOn: ["/cif/contact(.*)"],
  },
];

jest.mock("next/router", () => ({
  useRouter: jest.fn(),
}));

describe("The Navigation Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should not render the subheader links if the user is logged out", () => {
    mocked(useRouter).mockReturnValue({
      pathname: "/",
    } as any);
    render(<Navigation isLoggedIn={false} links={links} />);
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should not render the subheader links if the user is logged in but their IDIR is unauthorized", () => {
    mocked(useRouter).mockReturnValue({
      pathname: "/unauthorized_idir",
    } as any);
    render(<Navigation isLoggedIn={true} links={links} />);

    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should render the subheader links if the user is logged in and their IDIR is authorized", () => {
    mocked(useRouter).mockReturnValue({
      pathname: "/",
    } as any);
    render(<Navigation isLoggedIn={true} links={links} />);

    expect(screen.getByText("Home")).toBeVisible();
    expect(screen.getByText("Projects")).toBeVisible();
  });
});
