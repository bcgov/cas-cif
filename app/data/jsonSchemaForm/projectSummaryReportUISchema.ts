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
