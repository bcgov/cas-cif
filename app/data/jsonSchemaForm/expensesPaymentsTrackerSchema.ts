export const expensesPaymentsTrackerSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: [
    "eligibleExpensesToDate",
    "grossPaymentsToDate",
    "holdbackAmountToDate",
    "netPaymentsToDate",
  ],
  properties: {
    eligibleExpensesToDate: {
      title: "Total Eligible Expenses to Date",
      type: "number",
    },
    grossPaymentsToDate: {
      title: "Total Gross Payment Amount to Date",
      type: "number",
    },
    holdbackAmountToDate: {
      title: "Total Holdback Amount to Date",
      type: "number",
    },
    netPaymentsToDate: {
      title: "Total Net Payment Amount to Date",
      type: "number",
    },
  },
};

export const expensesPaymentsTrackerUiSchema = {
  "ui:order": [
    "eligibleExpensesToDate",
    "grossPaymentsToDate",
    "holdbackAmountToDate",
    "netPaymentsToDate",
  ],
  eligibleExpensesToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedEligibleExpensesToDate",
    hideOptional: true,
    isMoney: true,
    message: "This field cannot be calculated due to lack of information now.",
  },
  grossPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedGrossPaymentsToDate",
    hideOptional: true,
    isMoney: true,
    message: "This field cannot be calculated due to lack of information now.",
  },
  holdbackAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedHoldbackAmountToDate",
    hideOptional: true,
    isMoney: true,
    message: "This field cannot be calculated due to lack of information now.",
  },
  netPaymentsToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedNetPaymentsToDate",
    hideOptional: true,
    isMoney: true,
    message: "This field cannot be calculated due to lack of information now.",
  },
};
