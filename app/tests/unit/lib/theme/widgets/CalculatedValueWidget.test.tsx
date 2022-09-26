import { render, screen } from "@testing-library/react";
import CalculatedValueWidget from "lib/theme/widgets/CalculatedValueWidget";

describe("The CalculatedValueWidget", () => {
  it("renders the calculated value from the form context as specified in the uiSchema", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: 50 },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
        isMoney: true,
      },
    };
    render(<CalculatedValueWidget {...props} />);
    expect(screen.getByText("$50.00")).toBeInTheDocument();
  });

  it("renders 0 if the calculated value is zero", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: 0 },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
    };
    render(<CalculatedValueWidget {...props} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders empty string if the calculated value is null", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: null },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
    };
    render(<CalculatedValueWidget {...props} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });
});
