import { render, screen } from "@testing-library/react";
import { AdjustableCalculatedValueWidget } from "lib/theme/widgets/AdjustableCalculatedValueWidget";

describe("The AdjustableCalculatedValueWidget", () => {
  it("renders the calculated and adjusted value", () => {
    const props: any = {
      uiSchema: { calculatedValueFormContextProperty: "myProp" },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: 200,
      formContext: { myProp: 1000 },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    expect(screen.getByText("1,000")).toBeInTheDocument();

    expect(screen.getByLabelText(/test label \(adjusted\)/i)).toHaveValue(
      "200"
    );
  });

  it("renders the calculated and adjusted value with a $ sign if isMoney is true", () => {
    const props: any = {
      uiSchema: { isMoney: true, calculatedValueFormContextProperty: "myProp" },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: 200,
      formContext: { myProp: 1000 },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();

    expect(screen.getByLabelText(/test label \(adjusted\)/i)).toHaveValue(
      "$200.00"
    );
  });

  it("shows an empty input for adjusted value if no adjusted value provided", () => {
    const props: any = {
      uiSchema: { isMoney: true, calculatedValueFormContextProperty: "myProp" },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: undefined,
      formContext: { myProp: "100" },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    expect(screen.getByLabelText(/test label \(adjusted\)/i)).toHaveValue("");
  });
});
