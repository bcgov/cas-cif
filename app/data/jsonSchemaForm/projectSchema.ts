export default function getProjectSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema",
    description: "Schema describing the project form for the CIF application",
    type: "object",
    required: [
      "rfpNumber",
      "projectName",
      "summary",
      "operatorId",
      "fundingStreamRfpId",
      "totalFundingRequest",
    ],
    properties: {
      rfpNumber: {
        type: "string",
        title: "RFP Number",
        pattern: "^\\d{3,4}",
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
      operatorTradeName: {
        type: "string",
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
    },
  };
}
