import { render, screen } from "@testing-library/react";
import ModalWidget from "lib/theme/widgets/ModalWidget";

describe("ModalWidget", () => {
  it("Removes 'optional' from the label", () => {
    render(<ModalWidget label="Catherine Fisher (optional)" />);
    expect(screen.getByText(/Catherine Fisher/i)).toBeVisible();
    expect(screen.queryByText(/\(optional\)/i)).not.toBeInTheDocument();
  });
});
