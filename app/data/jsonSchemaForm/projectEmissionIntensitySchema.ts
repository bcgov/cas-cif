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
