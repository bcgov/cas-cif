export const reportingRequirementUiSchema = {
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
};
