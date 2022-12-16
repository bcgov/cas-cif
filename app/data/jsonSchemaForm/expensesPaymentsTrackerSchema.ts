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
};
