import { fireEvent, render, screen } from "@testing-library/react";
import FormBase from "components/Form/FormBase";

const testSchema = {
  type: "object",
  required: ["field"],
  properties: {
    field: {
      type: "string",
    },
  },
};

describe("The FormBase component", () => {
  it("renders an empty form from an empty schema", () => {
    const props = {
      schema: {},
      uiSchema: {},
    } as any;

    const formUnderTest = render(<FormBase {...props} />);

    expect(formUnderTest.container).toMatchSnapshot();
  });
  it("doesnt call onformerrors on first render if there are errors", () => {
    const onFormErrorsSpy = jest.fn();

    const formData = {
      field: undefined,
    };
    const props = {
      schema: testSchema,
      formData,
      onFormErrors: onFormErrorsSpy,
    } as any;

    render(<FormBase {...props} />);

    expect(onFormErrorsSpy).not.toHaveBeenCalled();
  });
  it("calls onformerrors with empty array if there are no errors", () => {
    const onFormErrorsSpy = jest.fn();

    const formData = {
      field: undefined,
    };
    const props = {
      schema: testSchema,
      formData,
      onFormErrors: onFormErrorsSpy,
      onChange: jest.fn(),
    } as any;

    render(<FormBase {...props} />);

    fireEvent.change(screen.getByLabelText("field"), {
      target: { value: "something" },
    });

    expect(onFormErrorsSpy).toHaveBeenCalledWith([]);
  });
  // TODO: replace with blur when appropriate
  it("no errors are raised on change", () => {
    const onFormErrorsSpy = jest.fn();

    const formData = {
      field: "initial value",
    };
    const props = {
      schema: testSchema,
      formData,
      onFormErrors: onFormErrorsSpy,
      onChange: jest.fn(),
    } as any;

    render(<FormBase {...props} />);

    fireEvent.change(screen.getByLabelText("field"), {
      target: { value: "" },
    });

    expect(onFormErrorsSpy).toHaveBeenCalledWith([]);
  });
});
