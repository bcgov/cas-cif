export const reportingRequirementUiSchema = {
  "ui:order": ["reportDueDate", "submittedDate", "comments"],
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
