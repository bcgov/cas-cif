const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project Funding Agreement Form",
  required: [
    "totalProjectValue",
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "anticipatedFundingAmount",
  ],
  properties: {
    totalProjectValue: {
      title: "Total Project Value",
      type: "number",
      default: undefined,
    },
    maxFundingAmount: {
      title: "Max Funding Amount",
      type: "number",
      default: undefined,
    },
    provinceSharePercentage: {
      title: "Province Share Percentage",
      type: "number",
      default: undefined,
    },
    holdbackPercentage: {
      title: "Holdback Percentage",
      type: "number",
      default: undefined,
    },
    anticipatedFundingAmount: {
      title: "Anticipated Funding Amount",
      type: "number",
      default: undefined,
    },
  },
};

export default schema;
