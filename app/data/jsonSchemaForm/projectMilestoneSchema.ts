export const milestoneReportingRequirementSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: ["description", "reportType", "reportDueDate"],
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
      default: undefined,
    },
    reportDueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Received Date",
      default: undefined,
    },
  },
};

export const milestoneSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Milestone",
  properties: {
    substantialCompletionDate: {
      type: "string",
      title: "Substantial Completion Date",
      default: undefined,
    },
    maximumAmount: {
      type: "number",
      title: "Maximum Amount",
      default: undefined,
    },
    totalEligibleExpenses: {
      type: "number",
      title: "Total Eligible Expenses",
      default: undefined,
    },
    certifiedBy: {
      type: "string",
      title: "Certifier",
    },
    certifierProfessionalDesignation: {
      type: "string",
      title: "Professional Designation",
      default: "Professional Engineer",
      anyOf: undefined,
    },
  },
};

export const milestoneReportingRequirementUiSchema = {
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
  reportDueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DueDateWidget",
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DateWidget",
  },
};

export const milestoneUiSchema = {
  "ui:order": [
    "substantialCompletionDate",
    "maximumAmount",
    "totalEligibleExpenses",
    "certifiedBy",
    "certifierProfessionalDesignation",
  ],
  substantialCompletionDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DateWidget",
  },
  maximumAmount: {
    "ui:widget": "MoneyWidget",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  totalEligibleExpenses: {
    "ui:widget": "MoneyWidget",
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  certifiedBy: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  certifierProfessionalDesignation: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
};
