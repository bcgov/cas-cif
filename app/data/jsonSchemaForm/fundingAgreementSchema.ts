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
      default: 1,
    },
    maxFundingAmount: {
      title: "Max Funding Amount",
      type: "number",
    },
    provinceSharePercentage: {
      title: "Province Share Percentage",
      type: "number",
    },
    holdbackPercentage: {
      title: "Holdback Percentage",
      type: "number",
    },
    anticipatedFundingAmount: {
      title: "Anticipated Funding Amount",
      type: "number",
    },
  },
};

export default schema;
