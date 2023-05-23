export const emissionIntensityReportSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Emissions Intensity Report",
  properties: {
    teimpReporting: {
      type: "object",
      title: "TEIMP Reporting",
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
      },
    },
    uponCompletion: {
      type: "object",
      title: "Upon Completion",
      properties: {
        adjustedEmissionsIntensityPerformance: {
          title: "GHG Emission Intensity Performance",
          type: "number",
        },
        dateSentToCsnr: {
          type: "string",
          title: "Date Invoice Sent to CSNR",
          default: undefined,
        },
        paymentPercentage: {
          type: "number",
          title: "Payment Percentage of Performance Milestone Amount (%)",
          default: undefined,
        },
        holdbackAmountToDate: {
          type: "number",
          title: "Maximum Performance Milestone Amount",
          default: undefined,
        },
        actualPerformanceMilestoneAmount: {
          type: "number",
          title: "Actual Performance Milestone Amount",
          default: undefined,
        },
      },
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
  teimpReporting: {
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
      "ui:widget": "NumberWidget",
      numberOfDecimalPlaces: 8,
    },
    targetEmissionIntensity: {
      "ui:widget": "NumberWidget",
      numberOfDecimalPlaces: 8,
    },
    postProjectEmissionIntensity: {
      "ui:widget": "NumberWidget",
      numberOfDecimalPlaces: 8,
    },
    totalLifetimeEmissionReduction: {
      "ui:widget": "NumberWidget",
      numberOfDecimalPlaces: 8,
    },
  },
  uponCompletion: {
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
      numberOfDecimalPlaces: 2,
      hideOptional: true,
      calculatedValueFormContextProperty: "teimpPaymentPercentage",
    },
    paymentPercentage: {
      "ui:widget": "CalculatedValueWidget",
      calculatedValueFormContextProperty:
        "paymentPercentageOfPerformanceMilestoneAmount",
      isPercentage: true,
      hideOptional: true,
      numberOfDecimalPlaces: 2,
    },
    actualPerformanceMilestoneAmount: {
      "ui:widget": "CalculatedValueWidget",
      calculatedValueFormContextProperty: "actualPerformanceMilestoneAmount",
      isMoney: true,
      hideOptional: true,
    },
    holdbackAmountToDate: {
      "ui:widget": "CalculatedValueWidget",
      calculatedValueFormContextProperty: "holdbackAmountToDate",
      isMoney: true,
      hideOptional: true,
    },
    dateSentToCsnr: {
      "ui:widget": "DateWidget",
    },
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
