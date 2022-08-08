import { render, screen } from "@testing-library/react";
import ReadOnlyCalculatedValueWidget from "lib/theme/widgets/ReadOnlyCalculatedValueWidget";

describe("The ReadOnlyCalculatedValueWidget", () => {
  it("renders the calculated value", () => {
    const props: any = {
      id: "test-id",
      formContext: { calculatedValue: 50 },
      label: "test-label",
    };
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByLabelText(/test-label/i)).toHaveTextContent("50");
  });

  it("renders 0% if the calculated value is null", () => {
    const props: any = {
      id: "test-id",
      formContext: { calculatedValue: null },
      label: "test-label",
    };
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByLabelText(/test-label/i)).toHaveTextContent("0");
  });
});
