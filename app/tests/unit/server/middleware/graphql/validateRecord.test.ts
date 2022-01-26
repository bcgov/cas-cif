import validateRecord from "server/middleware/graphql/validateRecord";

jest.mock("data/jsonSchemaForm/validationSchemas", () => ({
  test_schema: {
    $schema: "http://json-schema.org/draft-07/schema",
    description: "test schema",
    type: "object",
    required: ["required_prop", "formatted_prop", "enum_prop"],
    properties: {
      formatted_prop: {
        type: "string",
        title: "Formatted",
        pattern: "^\\d{3,4}",
      },
      required_prop: { type: "string", title: "Required" },
      enum_prop: {
        type: "number",
        title: "Enum",
        anyOf: undefined,
      },
    },
  },
}));

describe("The validateRecord function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Should return all errors in a schema", () => {
    const result = validateRecord("test_schema", {
      formatted_prop: "invalid!",
    });

    expect(result.length).toEqual(3);
    expect(result.map((error) => error.message)).toEqual([
      'should match pattern "^\\d{3,4}"',
      "should have required property 'required_prop'",
      "should have required property 'enum_prop'",
    ]);
  });

  it("Should return an empty array if there are no errors", () => {
    const result = validateRecord("test_schema", {
      formatted_prop: "0987",
      required_prop: "test string...",
      enum_prop: 123,
    });

    expect(result).toEqual([]);
  });
  it("Should throw if the schema is not found", () => {
    expect(() => validateRecord("this_schema_doesnt_exist", {})).toThrow(
      "No json schema found for schema with name this_schema_doesnt_exist"
    );
  });
});
