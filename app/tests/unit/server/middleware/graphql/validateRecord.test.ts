import validateRecord from "server/middleware/graphql/validateRecord";

const testSchema = {
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
};

describe("The validateRecord function", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Should return all errors in a schema", () => {
    const result = validateRecord(testSchema, {
      formatted_prop: "invalid!",
    });

    expect(result.length).toEqual(3);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          keyword: "pattern",
          params: { pattern: "^\\d{3,4}" },
        }),
        expect.objectContaining({
          keyword: "required",
          params: { missingProperty: "required_prop" },
        }),
        expect.objectContaining({
          keyword: "required",
          params: { missingProperty: "enum_prop" },
        }),
      ])
    );
  });

  it("Should return an empty array if there are no errors", () => {
    const result = validateRecord(testSchema, {
      formatted_prop: "0987",
      required_prop: "test string...",
      enum_prop: 123,
    });

    expect(result).toEqual([]);
  });
});
