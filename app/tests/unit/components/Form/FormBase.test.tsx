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

  it("passes the ref through", () => {
    const props = {
      schema: {},
      uiSchema: {},
      setRef: jest.fn(),
    } as any;

    render(<FormBase {...props} />);

    expect(props.setRef).toHaveBeenCalledTimes(1);
  });
});
