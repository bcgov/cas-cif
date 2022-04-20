import { render } from "@testing-library/react";
import FormBase from "components/Form/FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";

const testSchema = {
  type: "object",
  required: ["field"],
  properties: {
    field: {
      type: "string",
    },
  },
};

const testUiSchema = {
  type: {
    "ui:widget": "TextWidget",
  },
};

describe("The FormBase component", () => {
  it("renders a test schema with the default theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test" },
      uiSchema: testUiSchema,
    } as any;

    const formUnderTest = render(<FormBase {...props} />);

    expect(formUnderTest.container).toMatchSnapshot();
  });

  it("renders a test schema with the readonly theme", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test" },
      uiSchema: testUiSchema,
      theme: readOnlyTheme,
    } as any;

    const formUnderTest = render(<FormBase {...props} />);

    expect(formUnderTest.container).toMatchSnapshot();
  });

  it("passes the ref through with an HTML form element", () => {
    const props = {
      schema: {},
      uiSchema: {},
    } as any;

    const refUnderTest = jest.fn();

    render(<FormBase {...props} ref={refUnderTest} />);

    expect(refUnderTest).toHaveBeenCalledTimes(1);
    expect(refUnderTest).toHaveBeenCalledWith(
      expect.objectContaining({
        formElement: expect.any(HTMLFormElement),
      })
    );
  });
});
