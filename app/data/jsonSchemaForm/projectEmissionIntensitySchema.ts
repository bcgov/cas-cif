const schema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project TEIMP reporting",
  required: [],
  properties: {
    startDate: {
      title: "TIEMP Start Date",
      type: "string",
      default: undefined,
    },
    endDate: {
      title: "TEIMP End Date",
      type: "string",
      default: undefined,
    },
    reportDueDate: {
      title: "Report Due Date",
      type: "string",
      default: undefined,
    },
    reportReceivedDate: {
      title: "Report Received Date",
      type: "string",
      default: undefined,
    },
    generalComments: {
      title: "General Comments",
      type: "string",
      default: undefined,
    },
    functionalUnit: {
      title: "Functional Unit",
      type: "string",
      default: undefined,
    },
    baseLineEmissionIntensity: {
      title: "Base Line Emission Intensity (BEI)",
      type: "string",
    },
    projectEmissionIntensity: {
      title: "Project Emission Intensity (PEI)",
      type: "string",
    },
    totalLifetimeEmissionsReductions: {
      title: "Total Lifetime Emissions Reductions",
      type: "string",
    },
  },
};

export default schema;
