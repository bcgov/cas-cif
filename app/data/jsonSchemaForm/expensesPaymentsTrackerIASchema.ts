export const expensesPaymentsTrackerIASchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["Total Gross Payment Amount to Date"],
  properties: {
    totalPaymentAmountToDate: {
      title: "Total Payment Amount to Date",
      type: "number",
    },
  },
};

export const expensesPaymentsTrackerIAUiSchema = {
  "ui:order": ["totalPaymentAmountToDate"],
  totalPaymentAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedTotalPaymentAmountToDate",
    hideOptional: true,
    isMoney: true,
  },
};
