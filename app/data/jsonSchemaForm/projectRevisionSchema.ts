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
      type: "array",
      title: "Ammendment Type",
      items: {
        type: "string",
        enum: [],
      },
      uniqueItems: true,
    },
  },
};

export const projectRevisionUISchema = {
  revisionType: {
    "ui:widget": "radio",
  },
  amendmentType: {
    "ui:widget": "checkboxes",
  },
};
