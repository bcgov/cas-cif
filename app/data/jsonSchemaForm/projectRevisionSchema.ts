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
  },
  dependencies: {
    revisionType: {
      oneOf: [
        {
          properties: {
            revisionType: {
              const: !"General Revision",
            },
          },
        },
        {
          properties: {
            revisionType: {
              const: "General Revision",
            },
            amendmentTypes: {
              type: "array",
              title: "Ammendment Types",
              items: {
                type: "string",
                enum: ["test", "test"],
              },
              uniqueItems: true,
            },
          },
          required: ["amendmentTypes"],
        },
      ],
    },
  },
};

export const projectRevisionUISchema = {
  revisionType: {
    "ui:widget": "radio",
  },
  amendmentTypes: {
    "ui:widget": "checkboxes",
  },
};
