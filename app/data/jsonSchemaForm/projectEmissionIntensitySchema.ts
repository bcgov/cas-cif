export const emissionIntensityReportSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project TEIMP reporting",
  required: [
    "measurementPeriodStartDate",
    "measurementPeriodEndDate",
    "emissionFunctionalUnit",
    "baselineEmissionIntensity",
    "targetEmissionIntensity",
  ],
  properties: {
    measurementPeriodStartDate: {
      title: "Measurement period start date",
      type: "string",
    },
    measurementPeriodEndDate: {
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
      type: "number",
    },
    targetEmissionIntensity: {
      title: "Target Emission Intensity (TEI)",
      type: "number",
    },
    postProjectEmissionIntensity: {
      title: "Post Project Emission Intensity",
      type: "number",
    },
    totalLifetimeEmissionReduction: {
      title: "Total lifetime emissions reductions",
      type: "number",
    },
    calculatedGHGEmissionIntensityPerformance: {
      title: "GHG Emission Intensity Performance",
      type: "number",
    },
    adjustedGHGEmissionIntensityPerformance: {
      title: "GHG Emission Intensity Performance (Adjusted)",
      type: "number",
    },
  },
};

export const emissionIntensityReportingRequirementSchema = {
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

export const emissionIntensityReportUiSchema = {
  measurementPeriodStartDate: {
    "ui:widget": "DateWidget",
  },
  measurementPeriodEndDate: {
    "ui:widget": "DateWidget",
  },
  baselineEmissionIntensity: {
    "ui:widget": "TextWidget",
  },
  targetEmissionIntensity: {
    "ui:widget": "TextWidget",
  },
  postProjectEmissionIntensity: {
    "ui:widget": "TextWidget",
  },
  totalLifetimeEmissionReduction: {
    "ui:widget": "TextWidget",
  },
  calculatedGHGEmissionIntensityPerformance: {
    "ui:widget": "ReadOnlyCalculatedValueWidget",
    isPercent: true,
  },
  adjustedGHGEmissionIntensityPerformance: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isPercent: true,
  },
};

export const emissionIntensityReportingRequirementUiSchema = {
  reportDueDate: {
    "ui:widget": "DateWidget",
  },
  submittedDate: {
    "ui:widget": "DateWidget",
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
};
