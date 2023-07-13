import AdditionalFundingSourcesArrayFieldTemplate from "components/Form/AdditionalFundingSourcesArrayFieldTemplate";
import AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate from "components/Form/AnticipatedFundingAmountByFiscalYearArrayFieldTemplate";

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
    "ui:ArrayFieldTemplate":
      AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate,
    itemTitle: "Anticipated Funding Amount Per Fiscal Year",
    "ui:order": ["fiscalyear", "anticipatedFundingAmount"],
    items: {
      fiscalYear: {
        "ui:widget": "TextWidget",
      },
      anticipatedFundingAmount: {
        "ui:title": `Anticipated Amount Per Fiscal Year`,
        "ui:widget": "NumberWidget",
        isMoney: true,
      },
    },
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
    itemTitle: "Additional Funding Source",
    "ui:ArrayFieldTemplate": AdditionalFundingSourcesArrayFieldTemplate,
    items: {
      "ui:order": ["source", "amount", "status"],
      source: {
        "ui:title": `Additional Funding Source`,
        "ui:widget": "TextWidget",
      },
      amount: {
        "ui:title": `Additional Funding Amount`,
        "ui:widget": "NumberWidget",
        isMoney: true,
      },
      status: {
        "ui:title": `Additional Funding Status`,
        "ui:widget": "SearchWidget",
      },
    },
  },
};
