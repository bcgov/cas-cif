import ReadOnlyAnticipatedFundingPerFiscalYearArrayFieldTemplate from "components/Form/ReadOnlyAnticipatedFundingPerFiscalYearArrayFieldTemplate";

export const fundingParameterEPUiSchema = {
  "ui:order": [
    "contractStartDate",
    "projectAssetsLifeEndDate",
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "proponentCost",
    "proponentsSharePercentage",
    "anticipatedFundingAmount",
    "anticipatedFundingAmountPerFiscalYear",
    "totalProjectValue",
    "additionalFundingSources",
    "netPaymentsToDate",
    "grossPaymentsToDate",
    "holdbackAmountToDate",
    "eligibleExpensesToDate",
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
  holdbackPercentage: {
    "ui:widget": "NumberWidget",
    isPercentage: true,
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
    items: {
      "ui:order": ["anticipatedFundingAmount", "fiscalYear"],
      anticipatedFundingAmount: {
        "ui:title": `in ui schema brianna`,
        // "ui:widget": "CalculatedValueWidget",
        // calculatedValueFormContextProperty:
        //   "calculatedAnticipatedFundingAmountPerFiscalYear",
        isMoney: true,
      },
      fiscalYear: {
        "ui:widget": "TextWidget",
      },
    },
    "ui:ArrayFieldTemplate":
      ReadOnlyAnticipatedFundingPerFiscalYearArrayFieldTemplate,
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
  eligibleExpensesToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedEligibleExpensesToDate",
    hideOptional: true,
    isMoney: true,
  },
  grossPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedGrossPaymentsToDate",
    hideOptional: true,
    isMoney: true,
  },
  holdbackAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedHoldbackAmountToDate",
    hideOptional: true,
    isMoney: true,
  },
  netPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedNetPaymentsToDate",
    hideOptional: true,
    isMoney: true,
  },
  additionalFundingSources: {
    items: {
      "ui:order": ["source", "amount", "status"],
      source: {
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
