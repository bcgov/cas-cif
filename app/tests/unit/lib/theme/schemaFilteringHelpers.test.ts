import { getSchemaAndDataIncludingCalculatedValues } from "lib/theme/schemaFilteringHelpers";
import type { JSONSchema7 } from "json-schema";

describe("The getSchemaAndDataIncludingCalculatedValues function", () => {
  it("returns a filtered schema and form data", () => {
    const formSchema: JSONSchema7 = {
      type: "object",
      title: "Test schema",
      $schema: "http://json-schema.org/draft-07/schema",
      required: ["alpha", "bravo", "charlie"],
      properties: {
        alpha: {
          type: "string",
          title: "ALPHA",
        },
        bravo: {
          type: "string",
          title: "BRAVO",
        },
        charlie: {
          type: "string",
          title: "CHARLIE",
        },
        delta: {
          type: "string",
          title: "DELTA",
        },
      },
    };
    const formDataIncludingCalculatedValues = {
      alpha: "a",
      bravo: "b",
      charlie: "c",
      delta: "d",
    };
    const oldFormDataIncludingCalculatedValues = {
      alpha: "a",
      bravo: "b",
      charlie: "changed c",
      delta: "changed d",
    };
    const additionalSchemaProperties = {
      anAdditionalProperty: { title: "additional", type: "text" },
    };
    const expected = getSchemaAndDataIncludingCalculatedValues(
      formSchema,
      formDataIncludingCalculatedValues,
      oldFormDataIncludingCalculatedValues,
      additionalSchemaProperties
    );
    expect(expected).toEqual({
      formSchema: {
        $schema: "http://json-schema.org/draft-07/schema",
        properties: {
          charlie: {
            title: "CHARLIE",
            type: "string",
          },
          delta: {
            title: "DELTA",
            type: "string",
          },
        },
        required: ["alpha", "bravo", "charlie"],
        title: "Test schema",
        type: "object",
      },
      formData: {
        charlie: "c",
        delta: "d",
      },
    });
  });
});
