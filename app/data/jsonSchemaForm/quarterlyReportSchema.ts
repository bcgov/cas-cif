const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Quarterly-Report",
  required: ["quarterlyReportId", "dueDate"],
  properties: {
    quarterlyReportId: {
      type: "number",
      title: "Quarterly Report",
      default: undefined,
      anyOf: undefined,
    },
    dueDate: {
      type: "string",
      title: "Due Date",
      //brianna -- set quarterly dates here?
      default: undefined,
    },
    // brianna --is this received date? there's also completion date
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
