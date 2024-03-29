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
    projectType: {
      type: ["null", "string"],
      title: "Project Type",
    },
    score: {
      type: ["null", "number"],
      title: "Score",
      default: null,
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
      type: ["null", "string"],
      title: "Additional Sector Information",
      default: null,
    },
    contractNumber: {
      type: ["null", "string"],
      title: "Contract Number",
      default: null,
    },
    comments: {
      type: ["null", "string"],
      title: "General Comments",
      default: null,
    },
  },
};

export default projectSchema;
