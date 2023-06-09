import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("sets value to undefined when the field is cleared", () => {
    const props: any = {
      uiSchema: { isMoney: true, calculatedValueFormContextProperty: "myProp" },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: "1",
      formContext: { myProp: "100" },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);
    userEvent.clear(
      screen.getByRole("textbox", { name: /test label \(adjusted\)/i })
    );

    expect(props.onChange).toHaveBeenLastCalledWith(undefined);
  });

  it("renders the help tooltip", () => {
    const props: any = {
      uiSchema: { isMoney: true, calculatedValueFormContextProperty: "myProp" },
      schema: { type: "number", title: "Test Label", default: undefined },
      id: "test-id",
      label: "Test Label",
      onChange: jest.fn(),
      value: "1",
      formContext: { myProp: "100" },
    };
    render(<AdjustableCalculatedValueWidget {...props} />);

    const helpIcon = screen.getByLabelText("test-label-(adjusted)-tooltip");
    expect(helpIcon).toBeInTheDocument();

    fireEvent.mouseOver(helpIcon);
    expect(screen.getByRole("tooltip")).toBeInTheDocument();
  });
});
