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
    },
    productionFunctionalUnit: {
      title: "Production Functional Unit",
      type: "string",
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
    adjustedEmissionsIntensityPerformance: {
      title: "GHG Emission Intensity Performance",
      type: "number",
    },
    calculatedPaymentPercentage: {
      title: "Payment percentage of performance milestone amount",
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
      title: "Report Received Date",
      default: undefined,
    },
    comments: {
      type: "string",
      title: "General Comments",
    },
  },
};

export const emissionIntensityReportUiSchema = {
  emissionFunctionalUnit: {
    "ui:widget": "TextWidget",
    classNames: "functional-unit",
  },
  productionFunctionalUnit: {
    "ui:widget": "TextWidget",
    classNames: "functional-unit",
  },
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
  adjustedEmissionsIntensityPerformance: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedEiPerformance",
    isPercent: true,
    hideOptional: true,
  },
  calculatedPaymentPercentage: {
    "ui:widget": "ReadOnlyCalculatedValueWidget",
    isPercent: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "teimpPaymentPercentage",
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
