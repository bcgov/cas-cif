export const fundingParameterIASchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: [
    "maxFundingAmount",
    "provinceSharePercentage",
    "anticipatedFundingAmount",
    "proponentCost",
    "contractStartDate",
    "projectAssetsLifeEndDate",
  ],
  properties: {
    totalProjectValue: {
      title: "Total Project Value",
      type: "number",
    },
    maxFundingAmount: {
      title: "Maximum Funding Amount",
      type: "number",
    },
    provinceSharePercentage: {
      title: "Province's Share Percentage",
      type: "number",
    },
    anticipatedFundingAmount: {
      title: "Anticipated/Actual Funding Amount",
      type: "number",
    },
    anticipatedFundingAmountPerFiscalYear: {
      title: "Anticipated Funding Amount Per Fiscal Year",
      type: "string",
    },
    proponentCost: {
      title: "Proponent Cost",
      type: "number",
    },
    contractStartDate: {
      title: "Contract Start Date",
      type: "string",
    },
    projectAssetsLifeEndDate: {
      title: "Project Assets Life End Date",
      type: "string",
    },
    proponentsSharePercentage: {
      title: "Proponent's Share Percentage",
      type: "number",
    },
  },
};

export const fundingParameterIAUiSchema = {
  "ui:order": [
    "maxFundingAmount",
    "provinceSharePercentage",
    "proponentCost",
    "proponentsSharePercentage",
    "contractStartDate",
    "projectAssetsLifeEndDate",
    "anticipatedFundingAmount",
    "anticipatedFundingAmountPerFiscalYear",
    "totalProjectValue",
  ],
  totalProjectValue: {
    "ui:widget": "CalculatedValueWidget",
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedTotalProjectValue",
  },
  maxFundingAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  provinceSharePercentage: {
    "ui:widget": "NumberWidget",
    isPercentage: true,
    numberOfDecimalPlaces: 2,
  },
  proponentsSharePercentage: {
    "ui:widget": "CalculatedValueWidget",
    numberOfDecimalPlaces: 2,
    isPercentage: true,
    calculatedValueFormContextProperty: "calculatedProponentsSharePercentage",
    hideOptional: true,
  },
  anticipatedFundingAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  anticipatedFundingAmountPerFiscalYear: {
    "ui:options": {
      label: false,
    },
    "ui:widget": "AnticipatedFundingAmountPerFiscalYearWidget",
    title: "",
    hideOptional: true,
  },
  proponentCost: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  contractStartDate: {
    "ui:widget": "DateWidget",
  },
  projectAssetsLifeEndDate: {
    "ui:widget": "DateWidget",
  },
};
