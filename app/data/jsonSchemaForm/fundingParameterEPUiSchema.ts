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
      text: "<div><ul><li>Total Project Value = Maximum Funding Amount + Proponent Cost + Additional Funding Amount (Source 1) + Additional Funding Amount (Source 2) + ... + Additional Funding amount (Source N).</li></ul></div>",
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedTotalProjectValue",
  },
  maxFundingAmount: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div><ul><li>The maximum payment amount that the proponent can receive from CIF.</li></ul></div>",
    },
    isMoney: true,
  },
  provinceSharePercentage: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div><ul><li>Typically, 50% at most.</li></ul></div>",
    },
    isPercentage: true,
    numberOfDecimalPlaces: 2,
  },
  holdbackPercentage: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div><ul><li>Typically, 10%.</li><li>2019 projects may have percentages higher than 10%.</li></ul></div>",
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
  eligibleExpensesToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: "<div><ul><li>The accumulated Total Eligible Expenses from all completed Milestone Reports.</li></ul></div>",
    },
    calculatedValueFormContextProperty: "calculatedEligibleExpensesToDate",
    hideOptional: true,
    isMoney: true,
  },
  grossPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: "<div><ul><li>The accumulated Gross Payment Amounts from all completed Milestone Reports.</li><li>The Total Gross Payment Amoun To Date should be NO GREATER than the Maximum Funding Amount.</li></ul></div>",
    },
    calculatedValueFormContextProperty: "calculatedGrossPaymentsToDate",
    hideOptional: true,
    isMoney: true,
  },
  holdbackAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: "<div><ul><li>The accumulated Holdback Payment Amounts from all completed Milestone Reports.</li></ul></div>",
    },
    calculatedValueFormContextProperty: "calculatedHoldbackAmountToDate",
    hideOptional: true,
    isMoney: true,
  },
  netPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    "ui:tooltip": {
      text: "<div><ul><li>The accumulated Net Payment Amounts from all completed Milestone Reports.</li></ul></div>",
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
