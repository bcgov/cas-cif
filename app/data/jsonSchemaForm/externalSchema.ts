const externalSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: ["fundingStreamRfpId", "projectName", "legalName"],
  properties: {
    fundingStreamRfpId: {
      type: "number",
      title: "RFP Year ID",
      default: undefined,
    },

    projectName: { type: "string", title: "Project Name" },
    legalName: { type: "string", title: "Legal Name" },
  },
};

export default externalSchema;
