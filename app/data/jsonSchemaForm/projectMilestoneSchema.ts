const schema = {
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
      default: "undefined",
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

export default schema;
