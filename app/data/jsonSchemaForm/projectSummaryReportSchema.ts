export const projectSummaryReportSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "",
  required: [
    "reportDueDate",
    "projectSummaryReportPayment",
    "paymentNotes",
    "dateSentToCsnr",
  ],
  properties: {
    reportDueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Report Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "General Comments",
    },
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
  reportDueDate: {
    "ui:widget": "DateWidget",
    isDueDate: true,
  },
  submittedDate: {
    "ui:widget": "DateWidget",
    isReceivedDate: true,
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
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
