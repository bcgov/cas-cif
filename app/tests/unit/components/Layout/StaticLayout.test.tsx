import StaticLayout from "components/Layout/StaticLayout";
import { render, screen } from "@testing-library/react";

const renderStaticLayout = () => {
  return render(<StaticLayout />);
};

describe("The StaticLayout component", () => {
  beforeEach(() => {
    jest.spyOn(require("next/router"), "useRouter").mockImplementation(() => {
      return { pathname: "/" };
    });
  });
  it("should not render login button", () => {
    renderStaticLayout();
    expect(screen.queryByText("Login")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
  });

  it("should not render the subheader links", () => {
    renderStaticLayout();
    expect(screen.getByText("CleanBC Industry Fund")).toBeVisible();
    expect(screen.queryByText("Home")).toBeNull();
    expect(screen.queryByText("Projects")).toBeNull();
    expect(screen.queryByText("Operators")).toBeNull();
    expect(screen.queryByText("Contacts")).toBeNull();
  });
});
