export const paymentSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Payment",
  properties: {
    adjustedGrossAmount: {
      type: "number",
      title: "Milestone Gross Payment Amount",
      default: undefined,
    },
    adjustedNetAmount: {
      type: "number",
      title: "Milestone Net Payment Amount",
      default: undefined,
    },
    dateSentToCsnr: {
      type: "string",
      title: "Date Invoice Sent to CSNR",
      default: undefined,
    },
  },
};

export const paymentUiSchema = {
  adjustedGrossAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  adjustedNetAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
};
