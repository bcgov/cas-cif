const projectSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: [
    "proposalReference",
    "projectName",
    "summary",
    "operatorId",
    "fundingStreamRfpId",
    "totalFundingRequest",
    "projectStatusId",
    "sectorName",
  ],
  properties: {
    proposalReference: {
      type: "string",
      title: "Proposal Reference",
    },
    projectName: { type: "string", title: "Project Name" },
    totalFundingRequest: {
      type: "number",
      title: "Total Funding Request",
      default: undefined,
    },
    summary: { type: "string", title: "Summary" },
    operatorId: {
      type: "number",
      title: "Legal Operator Name and BC Registry ID",
      default: undefined,
      anyOf: undefined,
    },
    fundingStreamRfpId: {
      type: "number",
      title: "Funding Stream RFP ID",
      default: undefined,
    },
    projectStatusId: {
      type: "number",
      title: "Project Status",
      default: undefined,
    },
    sectorName: {
      type: "string",
      title: "Sector",
      default: undefined,
      anyOf: undefined,
    },
    additionalSectorInformation: {
      type: "string",
      title: "Additional Sector Information",
    },
    comments: { type: "string", title: "General Comments" },
  },
};

export default projectSchema;
