export const fundingAgreementSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: [
    "totalProjectValue",
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "anticipatedFundingAmount",
    "proponentCost",
  ],
  properties: {
    totalProjectValue: {
      title: "Total Project Value",
      type: "number",
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
    proponentCost: {
      title: "Proponent Cost",
      type: "number",
    },
  },
};

export const fundingAgreementUiSchema = {
  "ui:order": [
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "proponentCost",
    "totalProjectValue",
    "anticipatedFundingAmount",
  ],
  totalProjectValue: {
    "ui:widget": "ReadonlyCalculatedValueWidget",
    isMoney: true,
  },
  maxFundingAmount: {
    "ui:widget": "MoneyWidget",
  },
  provinceSharePercentage: {
    "ui:widget": "PercentageWidget",
  },
  holdbackPercentage: {
    "ui:widget": "PercentageWidget",
  },
  anticipatedFundingAmount: {
    "ui:widget": "MoneyWidget",
  },
  proponentCost: {
    "ui:widget": "MoneyWidget",
  },
};
