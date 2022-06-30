export const paymentSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Payment",
  properties: {
    grossAmount: {
      type: "number",
      title: "Gross Amount",
      default: undefined,
    },
    netAmount: {
      type: "number",
      title: "Gross Amount",
      default: undefined,
    },
    dateSentToCsnr: {
      type: "string",
      title: "Date sent to CSNR",
      default: undefined,
    },
  },
};

export const paymentUiSchema = {
  grossAmount: {
    "ui:widget": "MoneyWidget",
  },
  netAmount: {
    "ui:widget": "MoneyWidget",
  },
  dateSentToCsnr: {
    "ui:widget": "date",
  },
};
