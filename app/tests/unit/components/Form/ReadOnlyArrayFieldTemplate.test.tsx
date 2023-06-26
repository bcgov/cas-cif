import { render, screen } from "@testing-library/react";
import ReadOnlyArrayFieldTemplate from "components/Form/ReadOnlyArrayFieldTemplate";
import FormBase from "components/Form/FormBase";
import { JSONSchema7 } from "json-schema";

const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",

  properties: {
    testProperty: {
      title: "Test property",
      minItems: 0,
      type: "array",
      items: {
        $ref: "#/definitions/testPropertyItems",
      },
    },
  },
  definitions: {
    testPropertyItems: {
      type: "object",
      properties: {
        property2: {
          title: "Property 2",
          type: "string",
        },
        property3: {
          title: "Property 3",
          type: "number",
        },
      },
    },
  },
};

const uiSchema = {
  testProperty: {
    itemTitle: "Test Item title",
    items: {
      property2: {
        "ui:widget": "TextWidget",
        hideOptional: true,
      },
      property3: {
        "ui:widget": "NumberWidget",
        isMoney: true,
      },
    },
  },
};
describe("ReadOnlyArrayFieldTemplate", () => {
  it("Displays data and itemTitle for every item, and does not display any add or remove buttons", () => {
    render(
      <FormBase
        schema={schema as JSONSchema7}
        uiSchema={uiSchema}
        ArrayFieldTemplate={ReadOnlyArrayFieldTemplate}
        formData={{
          testProperty: [
            { property2: "a", property3: 5 },
            { property2: "b", property3: 500 },
          ],
        }}
      />
    );
    expect(screen.getByText(/Test Item title 1/i)).toBeVisible();
    expect(screen.getByText(/Test Item title 2/i)).toBeVisible();
    expect(screen.getAllByLabelText(/Property 2/i)[0]).toHaveValue("a");
    expect(screen.getAllByLabelText(/property 3/i)[0]).toHaveValue("$5.00");
    expect(screen.getAllByLabelText(/property 2/i)[1]).toHaveValue("b");
    expect(screen.getAllByLabelText(/property 3/i)[1]).toHaveValue("$500.00");
    expect(screen.queryByRole("button")).toBeNull();
  });
});
