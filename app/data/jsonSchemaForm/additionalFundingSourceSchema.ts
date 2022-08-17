const additionalFundingSourceSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Additional Funding Source",
  properties: {
    source: {
      title: "Additional Funding Source",
      type: "string",
    },
    amount: {
      title: "Additional Funding Amount",
      type: "number",
    },
    status: {
      title: "Additional Funding Status",
      type: "string",
      default: undefined,
      anyOf: undefined,
    },
  },
};

export default additionalFundingSourceSchema;
