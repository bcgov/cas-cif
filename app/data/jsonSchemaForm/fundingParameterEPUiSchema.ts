import { fundingTooltips } from "./tooltipText";

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
    "ui:tooltip": {
      text: fundingTooltips.totalProjectValue,
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedTotalProjectValue",
  },
  maxFundingAmount: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: fundingTooltips.maxFundingAmount,
    },
    isMoney: true,
  },
  provinceSharePercentage: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: fundingTooltips.provinceSharePercentage,
    },
    isPercentage: true,
    numberOfDecimalPlaces: 2,
  },
  holdbackPercentage: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: fundingTooltips.holdbackPercentage,
    },
    isPercentage: true,
    numberOfDecimalPlaces: 2,
  },
  proponentsSharePercentage: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: fundingTooltips.proponentsSharePercentage,
    },
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
    "ui:tooltip": {
      text: fundingTooltips.proponentCost,
    },
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
    "ui:tooltip": {
      text: fundingTooltips.eligibleExpensesToDate,
    },
    calculatedValueFormContextProperty: "calculatedEligibleExpensesToDate",
    hideOptional: true,
    isMoney: true,
  },
  grossPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: fundingTooltips.grossPaymentsToDate,
    },
    calculatedValueFormContextProperty: "calculatedGrossPaymentsToDate",
    hideOptional: true,
    isMoney: true,
  },
  holdbackAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: fundingTooltips.holdbackAmountToDate,
    },
    calculatedValueFormContextProperty: "calculatedHoldbackAmountToDate",
    hideOptional: true,
    isMoney: true,
  },
  netPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: fundingTooltips.netPaymentsToDate,
    },
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
        "ui:tooltip": {
          text: fundingTooltips.additionalFundingSourcesAmount,
        },
        isMoney: true,
      },
      status: {
        "ui:title": `Additional Funding Status`,
        "ui:widget": "SearchWidget",
      },
    },
  },
};
