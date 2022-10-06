export const projectRevisionCreateSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Revision Type",
  required: ["revisionType"],
  properties: {
    revisionType: {
      type: "string",
      enum: ["Amendment", "General Revision", "Minor Revision"],
    },
  },
};

export const projectRevisionSelectFormsSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  properties: {
    forms: {
      type: "array",
      title: "Substantial Completion Date",
      items: [
        {
          type: "string",
          title: "Revision Type",
          //   anyOf: ["Professional Engineer", "Certified Professional Accountant"],
          default: undefined,
          anyOf: undefined,
        },
      ],
      anyOf: undefined,
      default: undefined,
    },
  },
};

export const projectRevisionCreateUISchema = {
  revisionType: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "TextWidget",
  },
};
