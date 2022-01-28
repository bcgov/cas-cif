import { render } from "@testing-library/react";
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
  it("renders a test schema", () => {
    const props = {
      schema: testSchema,
      formData: { field: "test" },
      uiSchema: {},
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
