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
      type: "string",
      title: "Phone",
      pattern:
        "^(\\+?\\d{1,2}[\\s,-]?)?\\(?\\d{3}\\)?[\\s.-]?\\d{3}[\\s.-]?\\d{4}$",
    },
    phoneExt: {
      type: "string",
      title: "Phone Extension",
    },
    companyName: {
      type: "string",
      title: "Company Name",
    },
    contactPosition: {
      type: "string",
      title: "Position",
    },
    comments: {
      type: "string",
      title: "Comments",
    },
  },
};

export default contactSchema;
