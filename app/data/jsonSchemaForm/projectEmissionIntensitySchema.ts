export const emissionIntensityReportSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Emissions Intensity Report",
  required: [
    "measurementPeriodStartDate",
    "measurementPeriodEndDate",
    "emissionFunctionalUnit",
    "baselineEmissionIntensity",
    "targetEmissionIntensity",
  ],
  properties: {
    measurementPeriodStartDate: {
      title: "TEIMP Start Date",
      type: "string",
    },
    measurementPeriodEndDate: {
      title: "TEIMP End Date",
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
      title: "Baseline Emission Intensity (BEI)",
      type: "number",
    },
    targetEmissionIntensity: {
      title: "Target Emission Intensity (TEI)",
      type: "number",
    },
    postProjectEmissionIntensity: {
      title: "Post-Project Emission Intensity (PEI)",
      type: "number",
    },
    totalLifetimeEmissionReduction: {
      title: "Total Project Lifetime Emissions Reductions",
      type: "number",
    },
    adjustedEmissionsIntensityPerformance: {
      title: "GHG Emission Intensity Performance",
      type: "number",
    },
    calculatedPaymentPercentage: {
      title: "Payment Percentage of Performance Milestone Amount",
      type: "number",
    },
    adjustedHoldbackPaymentAmount: {
      title: "Holdback Payment Amount",
      type: "number",
    },
    dateSentToCsnr: {
      type: "string",
      title: "Date Invoice Sent to CSNR",
      default: undefined,
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
    isPercentage: true,
    numberOfDecimalPlaces: 2,
    hideOptional: true,
  },
  calculatedPaymentPercentage: {
    "ui:widget": "CalculatedValueWidget",
    isPercentage: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "teimpPaymentPercentage",
  },
  adjustedHoldbackPaymentAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    calculatedValueFormContextProperty: "teimpPaymentAmount",
    isMoney: true,
    hideOptional: true,
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
};

export const emissionIntensityReportingRequirementUiSchema = {
  reportDueDate: {
    "ui:widget": "DateWidget",
    isDueDate: true,
  },
  submittedDate: {
    "ui:widget": "DateWidget",
    isReceivedDate: true,
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
};
