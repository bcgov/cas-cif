import { render, screen } from "@testing-library/react";
import { AdjustableCalculatedValueWidget } from "lib/theme/widgets/AdjustableCalculatedValueWidget";

describe("The AdjustableCalculatedValueWidget", () => {
  it("renders the calculated and adjusted value", () => {
    const props: any = {
      uiSchema: { isMoney: true },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: "200",
      formContext: { testLabelCalculatedValue: "100" },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: /test label \(adjusted\)/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("textbox", {
        name: /test label \(adjusted\)/i,
      })
    ).toHaveValue("$200.00");
  });

  it("shows the calculated value as the default value for adjusted value, if no adjusted value provided", () => {
    const props: any = {
      uiSchema: { isMoney: true },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: undefined,
      formContext: { testLabelCalculatedValue: "100" },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    expect(
      screen.getByRole("textbox", {
        name: /test label \(adjusted\)/i,
      })
    ).toHaveValue("$100.00");
  });
});
