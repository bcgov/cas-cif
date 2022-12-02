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
    pendingActionsFrom: {
      type: "string",
      title: "Pending actions from",
      anyOf: [
        {
          type: "string",
          title: "Ops Team",
          enum: ["Ops Team"],
          value: "Ops Team",
        },
        {
          type: "string",
          title: "Director",
          enum: ["Director"],
          value: "Director",
        },
        {
          type: "string",
          title: "Tech Team",
          enum: ["Tech Team"],
          value: "Tech Team",
        },
        {
          type: "string",
          title: "Proponent",
          enum: ["Proponent"],
          value: "Proponent",
        },
      ],
    },
    revisionStatus: {
      type: "string",
      title: "Status",
      default: undefined,
      anyOf: undefined,
      enum: undefined,
    },
    dependencies: {
      revisionType: {
        oneOf: [
          {
            properties: {
              revisionType: {
                const: !"Amendment",
              },
            },
          },
          {
            properties: {
              revisionType: {
                const: "Amendment",
              },
              amendmentTypes: {
                type: "array",
                title: "Amendment Types",
                items: {
                  type: "string",
                  enum: [],
                },
                uniqueItems: true,
              },
            },
            required: ["amendmentTypes"],
          },
        ],
      },
    },
  },
};

export const projectRevisionUISchema = {
  "ui:order": [
    "revisionType",
    "amendmentTypes",
    "pendingActionsFrom",
    "amendmentStatus",
    "revisionStatus",
    "changeReason",
  ],
  revisionType: {
    "ui:widget": "radio",
  },
  amendmentTypes: {
    "ui:widget": "checkboxes",
  },
  pendingActionsFrom: {
    "ui:widget": "SelectWithNotifyWidget",
  },
  revisionStatus: {
    "ui:widget": "RevisionStatusWidget",
    "ui:options": {
      actionButtonLabel: "Update",
    },
  },
};
