import { emissionsIntentityTooltips } from "./tooltipText";

export const emissionIntensityReportingRequirementUiSchema = {
  "ui:order": [
    "reportDueDate",
    "submittedDate",
    "comments",
    "measurementPeriodStartDate", // aka TEIMP Start Date
    "measurementPeriodEndDate", // aka TEIMP End Date
    "emissionFunctionalUnit",
    "productionFunctionalUnit",
    "baselineEmissionIntensity",
    "targetEmissionIntensity",
    "postProjectEmissionIntensity",
    "totalLifetimeEmissionReduction",
    "calculatedEiPerformance", // aka GHG Emission Intensity Performance
    "adjustedEmissionsIntensityPerformance", // aka GHG Emission Intensity Performance (Adjusted)
    "dateSentToCsnr",
    "paymentPercentage", // aka Payment Percentage of Performance Milestone Amount (%)
    "actualPerformanceMilestoneAmount", // aka Actual Performance Milestone Amount
    "holdbackAmountToDate", // aka Maximum Performance Milestone Amount
  ],
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
  adjustedEmissionsIntensityPerformance: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    calculatedValueFormContextProperty: "calculatedEiPerformance",
    isPercentage: true,
    numberOfDecimalPlaces: 2,
    hideOptional: true,
    "ui:tooltip": {
      text: emissionsIntentityTooltips.adjustedEmissionsIntensityPerformance,
    },
  },
  calculatedEiPerformance: {
    isPercentage: true,
    numberOfDecimalPlaces: 2,
    hideOptional: true,
  },
  paymentPercentage: {
    "ui:widget": "CalculatedValueWidget",
    isPercentage: true,
    numberOfDecimalPlaces: 2,
    hideOptional: true,
    calculatedValueFormContextProperty:
      "paymentPercentageOfPerformanceMilestoneAmount",
    "ui:tooltip": {
      text: emissionsIntentityTooltips.paymentPercentage,
    },
  },
  actualPerformanceMilestoneAmount: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "actualPerformanceMilestoneAmount",
    isMoney: true,
    hideOptional: true,
    "ui:tooltip": {
      text: emissionsIntentityTooltips.actualPerformanceMilestoneAmount,
    },
  },
  holdbackAmountToDate: {
    "ui:widget": "CalculatedValueWidget",
    calculatedValueFormContextProperty: "holdbackAmountToDate",
    isMoney: true,
    hideOptional: true,
    renamedId: "maximumPerformanceMilestoneAmount",
    "ui:tooltip": {
      text: emissionsIntentityTooltips.holdbackAmountToDate,
    },
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
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

export const emissionIntensityReportingRequirementGroupSchema = [
  {
    title: "Reporting Requirement",
    fields: ["reportDueDate", "submittedDate", "comments"],
  },
  {
    title: "TEIMP Reporting",
    fields: [
      "measurementPeriodStartDate",
      "measurementPeriodEndDate",
      "emissionFunctionalUnit",
      "productionFunctionalUnit",
      "baselineEmissionIntensity",
      "targetEmissionIntensity",
      "postProjectEmissionIntensity",
      "totalLifetimeEmissionReduction",
    ],
  },
  {
    title: "Upon Completion",
    fields: [
      "adjustedEmissionsIntensityPerformance",
      "dateSentToCsnr",
      "paymentPercentage",
      "actualPerformanceMilestoneAmount",
      "holdbackAmountToDate",
    ],
  },
];
