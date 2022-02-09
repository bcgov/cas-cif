import { render, screen } from "@testing-library/react";
import FormBorder from "lib/theme/components/FormBorder";

describe("FormBorder", () => {
  it("does not render a legend element if title is undefined", () => {
    const { container } = render(<FormBorder />);
    expect(container.querySelector("legend")).toBeNull();
  });

  it("displays the title if it is defined", () => {
    render(<FormBorder title="Test" />);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });
});
