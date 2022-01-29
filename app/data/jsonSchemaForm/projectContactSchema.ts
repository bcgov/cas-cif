const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project Contact",
  required: ["contactId"],
  properties: {
    contactId: {
      title: "Contact",
      type: "number",
      default: undefined,
      anyOf: undefined,
    },
  },
};

export default schema;
