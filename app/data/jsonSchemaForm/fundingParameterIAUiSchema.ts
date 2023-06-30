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
      text: "<div><ul><li>Total Project Value = Maximum Funding Amount + Proponent Cost + Additional Funding Amount (Source 1) + Additional Funding Amount (Source 2) + ... + Additional Funding amount (Source N).</li></ul></div>",
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedTotalProjectValue",
  },
  maxFundingAmount: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div>The maximum payment amount that the proponent can receive from CIF.</li></ul></div>",
    },
    isMoney: true,
  },
  provinceSharePercentage: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div><ul><li>Typically, 50% at most.</div>",
    },
    isPercentage: true,
    numberOfDecimalPlaces: 2,
  },
  proponentsSharePercentage: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: "<div><ul><li>Proponent's share percentage = Proponent Cost / Total Project Value</li><li>The Proponent's Share Percentage should be NO LESS than 25%.</li><li>For 2021 projects, the Proponent's Share Percentage should be NO LESS than 25%.</li></ul></div>",
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
      text: "<div><ul><li>The amount of expenses paid by the proponent.</li></ul></div>",
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
          text: "<div><ul><li>The amount of payment from Funding Source N other than CIF.</li><li>Typically found in the original proposal (solicitation folder on the LAN).</li></ul></div>",
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
