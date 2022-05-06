const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: ["dueDate"],
  properties: {
    dueDate: {
      type: "string",
      format: "date",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      format: "date",
      title: "Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "General Comments",
    },
  },
};

export default schema;
