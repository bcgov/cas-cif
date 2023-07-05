import AdditionalFundingSourcesArrayFieldTemplate from "components/Form/AdditionalFundingSourcesArrayFieldTemplate";
import AnticipatedFundingAmountPerFiscalYearArrayFieldTemplate from "components/Form/AnticipatedFundingAmountByFiscalYearArrayFieldTemplate";
import { fundingTooltips } from "./tooltipText";

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
