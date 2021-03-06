const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Operator",
  required: ["legalName", "tradeName"],
  properties: {
    legalName: {
      type: "string",
      title: "Legal Name",
      default: undefined,
    },
    tradeName: {
      type: "string",
      title: "Trade Name",
      default: undefined,
    },
    bcRegistryId: {
      type: "string",
      title: "BC Registry ID",
      pattern: "^[a-zA-Z]{1,3}[0-9]{7}$",
    },
    operatorCode: {
      type: "string",
      title: "Operator Code",
      pattern: "^[A-Z]{4}$",
    },
  },
};

export default schema;
