export const fundingAgreementSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
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

export const fundingAgreementUiSchema = {
  totalProjectValue: {
    "ui:widget": "MoneyWidget",
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
};
