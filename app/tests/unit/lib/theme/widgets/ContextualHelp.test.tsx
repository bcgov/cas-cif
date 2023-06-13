import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import ContextualHelp from "lib/theme/widgets/ContextualHelp";

describe("ContextualHelp component", () => {
  const textMock = "Tooltip Text";
  const labelMock = "Field Label";

  test("renders the tooltip with correct text and label and matches the snapshot", () => {
    const componentUnderTest = render(
      <ContextualHelp text={textMock} icon={faInfoCircle} label={labelMock} />
    );
    const tooltipElement = screen.getByRole("tooltip");
    const tooltipIcon = screen.getByRole("img", {
      hidden: true,
    });
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute("aria-label", "field-label-tooltip");
    expect(tooltipIcon).toBeInTheDocument();

    expect(componentUnderTest.container).toMatchSnapshot();
  });

  test("renders the tooltip with default icon when not provided", () => {
    render(<ContextualHelp text={textMock} label={labelMock} />);

    const defaultIcon = screen.getByRole("img", {
      hidden: true,
    });
    expect(defaultIcon).toHaveAttribute("data-icon", "info-circle");
  });
  test("renders the tooltip with correct HTML text", async () => {
    const htmlText =
      "<div data-testid='test-id'>html text which has a <a href='#'>Link</a></div>";
    render(<ContextualHelp text={htmlText} label={labelMock} />);
    const tooltipElement = screen.getByRole("tooltip");
    expect(tooltipElement).toBeInTheDocument();
    expect(tooltipElement).toHaveAttribute("aria-label", "field-label-tooltip");

    fireEvent.mouseOver(tooltipElement);
    await waitFor(() => {
      expect(screen.getByTestId("test-id")).toBeInTheDocument();
      expect(screen.getByTestId("test-id").innerHTML).toBe(
        'html text which has a <a href="#">Link</a>'
      );
    });
  });
});
