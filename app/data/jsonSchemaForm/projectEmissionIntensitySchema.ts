export const projectEmissionIntensitySchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project TEIMP reporting",
  required: [],
  properties: {
    measurementPeriodStartDate: {
      title: "Measurement period start date",
      type: "string",
    },
    measurmentPeriodEndDate: {
      title: "Measurement period end date",
      type: "string",
    },
    emissionFunctionalUnit: {
      title: "Functional Unit",
      type: "string",
      default: undefined,
    },
    baselineEmissionIntensity: {
      title: "Base Line Emission Intensity (BEI)",
      type: "string",
    },
    targetEmissionIntensity: {
      title: "Target Emission Intensity (TEI)",
      type: "string",
    },
    postProjectEmissionIntensity: {
      title: "Post Project Emission Intensity",
      type: "string",
    },
    totalLifeTimeEmissionIntensity: {
      title: "Total lifetime emissions reductions",
      type: "string",
    },
  },
};

export const emissionIntensityReportingRequirements = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Reporting Requirement",
  required: [],
  properties: {
    reportDueDate: {
      type: "string",
      title: "Report Due Date",
      default: undefined,
    },
    submittedDate: {
      type: "string",
      title: "Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "General Comments",
    },
  },
};
