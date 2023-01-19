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
    summary: { type: "string", title: "Project Description" },
    projectType: { type: "string", title: "Project Type" },
    score: {
      type: "number",
      title: "Score",
    },
    rank: {
      type: "number",
      title: "Rank",
    },
    operatorId: {
      type: "number",
      title: "Legal Operator Name and BC Registry ID",
      default: undefined,
      anyOf: undefined,
    },
    fundingStreamRfpId: {
      type: "number",
      title: "RFP Year ID",
      default: undefined,
    },
    projectStatusId: {
      type: "number",
      title: "Project Status",
      default: undefined,
      anyOf: undefined,
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
    contractNumber: {
      type: "string",
      title: "Contract Number",
    },
    comments: { type: "string", title: "General Comments" },
  },
};

export default projectSchema;
