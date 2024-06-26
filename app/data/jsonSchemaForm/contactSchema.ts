const contactSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["givenName", "familyName", "email"],
  properties: {
    givenName: {
      type: "string",
      title: "Given Name",
    },
    familyName: {
      type: "string",
      title: "Family Name",
    },
    email: {
      type: "string",
      title: "Email",
      pattern: "^[\\.\\w-]+@([\\w-]+\\.)+[\\w-]{2,4}$",
    },
    phone: {
      type: ["null", "string"],
      title: "Phone",
      pattern:
        "^(\\+?\\d{1,2}[\\s,-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$",
      default: null,
    },
    phoneExt: {
      type: ["null", "string"],
      title: "Phone Extension",
      default: null,
    },
    companyName: {
      type: ["null", "string"],
      title: "Company Name",
      default: null,
    },
    contactPosition: {
      type: ["null", "string"],
      title: "Position",
      default: null,
    },
    comments: {
      type: ["null", "string"],
      title: "Comments",
      default: null,
    },
  },
};

export default contactSchema;
