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
    "additionalFundingSources",
    "totalPaymentAmountToDate",
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
  totalPaymentAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedTotalPaymentAmountToDate",
    hideOptional: true,
    isMoney: true,
  },
  additionalFundingSources: {
    items: {
      "ui:order": ["source", "amount", "status"],
      source: {
        "ui:title": `Additional Funding Source`,
        "ui:widget": "TextWidget",
        "ui:FieldTemplate": "AdditionalFundingSourcesFieldTemplate",
      },
      amount: {
        "ui:title": `Additional Funding Amount`,
        "ui:widget": "NumberWidget",
        isMoney: true,
        "ui:FieldTemplate": "AdditionalFundingSourcesFieldTemplate",
      },
      status: {
        "ui:title": `Additional Funding Status`,
        "ui:widget": "SearchWidget",
        "ui:FieldTemplate": "AdditionalFundingSourcesFieldTemplate",
      },
      // Custom array button prop that is used in ArrayFieldTemplate
      "ui:array-buttons": {
        addBtnLabel: "Add Funding Source",
        removeBtnLabel: "Remove",
      },
    },
  },
};
