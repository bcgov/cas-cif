const projectMilestoneUiSchema = {
  "ui:order": [
    "description",
    "reportType",
    "hasExpenses",
    "maximumAmount",
    "reportDueDate",
    "substantialCompletionDate",
    "certifiedBy",
    "certifierProfessionalDesignation",
    "submittedDate",
    "totalEligibleExpenses",
    "grossPaymentAmount",
    "calculatedGrossAmount",
    "adjustedGrossAmount",
    "calculatedNetAmount",
    "adjustedNetAmount",
    "calculatedHoldbackAmount",
    "adjustedHoldBackAmount",
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
    classNames: "hidden-title",
    "ui:widget": "hidden",
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
  },
  maximumAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  totalEligibleExpenses: {
    "ui:widget": "NumberWidget",
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
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  adjustedNetAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  dateSentToCsnr: {
    "ui:widget": "DateWidget",
  },
  grossPaymentAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isMoney: true,
  },
  calculatedHoldbackAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isMoney: true,
  },
  calculatedNetAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isMoney: true,
  },
  adjustedHoldBackAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isMoney: true,
  },
  calculatedGrossAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    isMoney: true,
  },
};

export default projectMilestoneUiSchema;
