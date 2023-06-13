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
    "grossPaymentAmount",
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
      text: "<div><ul><li>The maximum payment amount that the proponent can receive from CIF for this milestone.</li><li>Typically found in schedule D.</ul></div>",
    },
    isMoney: true,
    "ui:col-md": 12,
    "bcgov:size": "small",
  },
  totalEligibleExpenses: {
    "ui:widget": "NumberWidget",
    "ui:tooltip": {
      text: "<div>The amount of total eligible expenses paid by the proponent for this milestone.</div>",
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
      text: "<div><ul><li>Gross Payment Amount This Milestone = Total Eligible Expenses This Milestone x Province's Share Percentage.</li><li>The Gross Payment Amount This Milestone is the smaller value between the calculated value above and the Maximum Milestone Payment Amount This Milestone.</li></ul></div>",
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedGrossAmount",
  },
  adjustedNetAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    "ui:tooltip": {
      text: "<div>Net Payment Amount This Milestone = Gross Payment Amount This Milestone - Holdback Payment Amount This Milestone.</div>",
    },
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedNetAmount",
  },
  adjustedHoldbackAmount: {
    "ui:widget": "AdjustableCalculatedValueWidget",
    "ui:tooltip": {
      text: "<div>Holdback Payment Amount This Milestone = Gross Payment Amount This Milestone x Performance Milestone Holdback Percentage.</div>",
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
