import { emissionsIntentityTooltips } from "./tooltipText";

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
          type: ["null", "string"],
          default: null,
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
          type: ["null", "number"],
          default: null,
        },
        totalLifetimeEmissionReduction: {
          title: "Total Project Lifetime Emissions Reductions",
          type: ["null", "number"],
          default: null,
        },
      },
    },
    uponCompletion: {
      type: "object",
      title: "Upon Completion",
      properties: {
        adjustedEmissionsIntensityPerformance: {
          title: "GHG Emission Intensity Performance",
          type: ["null", "number"],
          default: null,
        },
        dateSentToCsnr: {
          type: ["null", "string"],
          title: "Date Invoice Sent to CSNR",
          default: null,
        },
        paymentPercentage: {
          type: "number",
          title: "Payment Percentage of Performance Milestone Amount (%)",
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
      type: ["null", "string"],
      title: "Report Due Date",
      default: null,
    },
    submittedDate: {
      type: ["null", "string"],
      title: "Report Received Date",
      default: null,
    },
    comments: {
      type: ["null", "string"],
      title: "General Comments",
      default: null,
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
      "ui:tooltip": {
        text: emissionsIntentityTooltips.adjustedEmissionsIntensityPerformance,
      },
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
      "ui:tooltip": {
        text: emissionsIntentityTooltips.paymentPercentage,
      },
      calculatedValueFormContextProperty:
        "paymentPercentageOfPerformanceMilestoneAmount",
      isPercentage: true,
      hideOptional: true,
      numberOfDecimalPlaces: 2,
    },
    actualPerformanceMilestoneAmount: {
      "ui:widget": "CalculatedValueWidget",
      "ui:tooltip": {
        text: emissionsIntentityTooltips.actualPerformanceMilestoneAmount,
      },
      calculatedValueFormContextProperty: "actualPerformanceMilestoneAmount",
      isMoney: true,
      hideOptional: true,
    },
    holdbackAmountToDate: {
      "ui:widget": "CalculatedValueWidget",
      "ui:tooltip": {
        text: emissionsIntentityTooltips.holdbackAmountToDate,
      },
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
