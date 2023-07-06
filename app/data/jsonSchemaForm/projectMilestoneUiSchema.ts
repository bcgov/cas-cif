import { milestoneTooltips } from "./tooltipText";

const projectMilestoneUiSchema = {
  "ui:order": [
    "description",
    "reportType",
    "hasExpenses",
    "maximumAmount",
    "substantialCompletionDate",
    "reportDueDate",
    "certifiedBy",
    "certifierProfessionalDesignation",
    "submittedDate",
    "totalEligibleExpenses",
    "calculatedGrossAmount",
    "adjustedGrossAmount",
    "calculatedNetAmount",
    "adjustedNetAmount",
    "calculatedHoldbackAmount",
    "adjustedHoldbackAmount",
    "dateSentToCsnr",
  ],
  description: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "TextAreaWidget",
  },
  reportType: {
    "ui:placeholder": "Select a Milestone Type",
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
  hasExpenses: {
    "ui:widget": "hidden",
    "ui:options": {
      label: false,
    },
  },
  reportDueDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DateWidget",
    isDueDate: true,
  },
  submittedDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DateWidget",
  },
  substantialCompletionDate: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "DateWidget",
    isBeginsDate: true,
  },
  maximumAmount: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: milestoneTooltips.maximumAmount,
    },
    isMoney: true,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  totalEligibleExpenses: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: milestoneTooltips.totalEligibleExpenses,
    },
    isMoney: true,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  certifiedBy: {
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  certifierProfessionalDesignation: {
    "ui:col-md": 12,
    "bcgov:size": "small",
    "ui:widget": "SearchWidget",
  },
  adjustedGrossAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    "ui:tooltip": {
      text: milestoneTooltips.adjustedGrossAmount,
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedGrossAmount",
  },
  adjustedNetAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    "ui:tooltip": {
      text: milestoneTooltips.adjustedNetAmount,
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedNetAmount",
  },
  adjustedHoldbackAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    "ui:tooltip": {
      text: milestoneTooltips.adjustedHoldBackAmount,
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedHoldbackAmount",
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
};

export default projectMilestoneUiSchema;
