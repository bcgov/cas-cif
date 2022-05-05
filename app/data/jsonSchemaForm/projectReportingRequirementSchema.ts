const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: ["dueDate"],
  properties: {
    dueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Submitted/Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "Comments",
    },
  },
};

export default schema;
