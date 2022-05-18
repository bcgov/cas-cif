export const projectMilestoneSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: [
    "description",
    "reportType",
    "reportDueDate",
    "certifiedByProfessionalDesignation",
  ],
  properties: {
    description: {
      type: "string",
      title: "Milestone Description",
      default: undefined,
    },
    reportType: {
      type: "string",
      title: "Milestone Type",
      anyOf: undefined,
    },
    maximumAmount: {
      type: "number",
      title: "Maximum Milestone Amount",
      default: undefined,
    },
    reportDueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    completionDate: {
      type: "string",
      title: "Substantial Completion Date",
      default: undefined,
    },
    certifiedByProfessionalDesignation: {
      type: "string",
      title: "Professional Designation",
      default: "Professional Engineer",
      anyOf: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Received Date",
      default: undefined,
    },
  },
};

export const milestoneReportUiSchema = {
  description: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "TextAreaWidget",
  },
  reportType: {
    "ui:placeholder": "Select a Milestone Type",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
  maximumAmount: {
    "ui:widget": "ConditionalAmountWidget",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  reportDueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "date",
  },
  completionDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "date",
  },
  certifiedByProfessionalDesignation: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "date",
  },
};
