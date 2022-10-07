export const projectRevisionCreateSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["revisionType"],
  properties: {
    revisionType: {
      type: "string",
      title: "Select Revision Type",
      default: "Amendment",
      enum: ["Amendment", "General Revision", "Minor Revision"],
    },
  },
};

export const projectRevisionCreateUISchema = {
  revisionType: {
    "ui:widget": "radio",
  },
};
