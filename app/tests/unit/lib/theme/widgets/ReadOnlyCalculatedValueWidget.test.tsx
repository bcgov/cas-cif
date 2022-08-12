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
      },
    };
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByLabelText(/test-label/i)).toHaveTextContent("50");
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
    expect(screen.getByLabelText(/test-label/i)).toHaveTextContent("0");
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
    render(<ReadOnlyCalculatedValueWidget {...props} />);
    expect(screen.getByLabelText(/test-label/i)).not.toHaveTextContent("0");
  });
});
