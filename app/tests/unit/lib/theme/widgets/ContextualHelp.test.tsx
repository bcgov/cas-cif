import { render, screen } from "@testing-library/react";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import ContextualHelp from "lib/theme/widgets/ContextualHelp";

describe("ContextualHelp component", () => {
  const titleMock = "Tooltip Title";
  const labelMock = "Field Label";

  test("renders the tooltip with correct title and label and matches the snapshot", () => {
    const componentUnderTest = render(
      <ContextualHelp
        title={titleMock}
        icon={faExclamationCircle}
        label={labelMock}
      />
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
    render(<ContextualHelp title={titleMock} label={labelMock} />);

    const defaultIcon = screen.getByRole("img", {
      hidden: true,
    });
    expect(defaultIcon).toHaveAttribute("data-icon", "exclamation-circle");
  });
});
