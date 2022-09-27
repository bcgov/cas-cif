import { render, screen } from "@testing-library/react";
import ReadOnlyCalculatedValueWidget from "lib/theme/widgets/ReadOnlyCalculatedValueWidget";

describe("The ReadOnlyCalculatedValueWidget", () => {
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
    render(<ReadOnlyCalculatedValueWidget {...props} />);
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
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it("renders empty string if the calculated value is null and no message prop is provided", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: null },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
    };
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders an explanatory message if calculated value is null and message is provided in the props", () => {
    const props: any = {
      id: "test-id",
      formContext: { someprop: null },
      label: "test-label",
      uiSchema: {
        calculatedValueFormContextProperty: "someprop",
      },
      message: "test message",
    };
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByText("test message")).toBeInTheDocument();
  });
});
