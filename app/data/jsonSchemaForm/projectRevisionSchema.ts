export const projectRevisionSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["revisionType"],
  properties: {
    revisionType: {
      type: "string",
      title: "Revision Type",
      default: undefined,
      anyOf: undefined,
      enum: undefined,
    },
    changeReason: {
      type: "string",
      title: "General Comments",
    },
    amendmentType: {
      type: "string",
      title: "Ammendment type",
      default: undefined,
      anyOf: undefined,
      enum: undefined,
    },
  },
};

export const projectRevisionUISchema = {
  revisionType: {
    "ui:widget": "radio",
  },
  amendmentType: {
    "ui:widget": "radio",
  },
};
