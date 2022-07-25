import Footer from "components/Layout/Footer";
import { render, screen } from "@testing-library/react";
import footerLinks from "data/dashboardLinks/footerLinks";

describe("The Footer Component", () => {
  it("Renders footer links", () => {
    render(<Footer />);
    footerLinks.forEach(({ name, href }) => {
      expect(screen.getByText(name)).toBeInTheDocument();
      expect(screen.getByText(name)).toHaveAttribute("href", href);
      expect(screen.getByText(name)).toHaveAttribute("target", "_blank");
    });
  });
});
