export const projectSummaryReportSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Upon Completion",
  required: ["projectSummaryReportPayment", "paymentNotes", "dateSentToCsnr"],
  properties: {
    projectSummaryReportPayment: {
      title: "Project Summary Report Payment",
      type: "number",
    },
    paymentNotes: {
      title: "Notes for the Payment",
      type: "string",
    },
    dateSentToCsnr: {
      title: "Date Invoice Sent to CSNR",
      type: "string",
      default: undefined,
    },
  },
};

export const projectSummaryReportUiSchema = {
  projectSummaryReportPayment: {
    "ui:widget": "TextWidget",
    isMoney: true,
    hideOptional: true,
  },
  paymentNotes: {
    "ui:widget": "TextAreaWidget",
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
};
