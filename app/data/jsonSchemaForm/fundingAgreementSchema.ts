export const fundingAgreementSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  required: [
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "anticipatedFundingAmount",
    "proponentCost",
    "contractStartDate",
    "projectAssetsLifeEndDate",
  ],
  properties: {
    totalProjectValue: {
      title: "Total Project Value",
      type: "number",
    },
    maxFundingAmount: {
      title: "Maximum Funding Amount",
      type: "number",
    },
    provinceSharePercentage: {
      title: "Province's Share Percentage",
      type: "number",
    },
    holdbackPercentage: {
      title: "Performance Milestone Holdback Percentage",
      type: "number",
    },
    anticipatedFundingAmount: {
      title: "Anticipated/Actual Funding Amount",
      type: "number",
    },
    anticipatedFundingAmountPerFiscalYear: {
      type: "array",
      items: {
        type: "object",
        properties: {
          amount: {
            type: "number",
          },
        },
      },
    },
    proponentCost: {
      title: "Proponent Cost",
      type: "number",
    },
    contractStartDate: {
      title: "Contract Start Date",
      type: "string",
    },
    projectAssetsLifeEndDate: {
      title: "Project Assets Life End Date",
      type: "string",
    },
    proponentsSharePercentage: {
      title: "Proponent's Share Percentage",
      type: "number",
    },
  },
  // definitions: {
  //   anticipatedFundingAmountPerFiscalYear: {
  //     type: "object",
  //     properties: {
  //       source: {
  //         title: "banabab",
  //         type: "number",
  //       },
  //     },
  //   },
  // },
};

export const fundingAgreementUiSchema = {
  "ui:order": [
    "maxFundingAmount",
    "provinceSharePercentage",
    "holdbackPercentage",
    "proponentCost",
    "proponentsSharePercentage",
    "contractStartDate",
    "projectAssetsLifeEndDate",
    "anticipatedFundingAmount",
    "anticipatedFundingAmountPerFiscalYear",
    "totalProjectValue",
  ],
  totalProjectValue: {
    "ui:widget": "CalculatedValueWidget",
    isMoney: true,
    hideOptional: true,
    calculatedValueFormContextProperty: "calculatedTotalProjectValue",
  },
  maxFundingAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  provinceSharePercentage: {
    "ui:widget": "NumberWidget",
    isPercentage: true,
  },
  holdbackPercentage: {
    "ui:widget": "NumberWidget",
    isPercentage: true,
  },
  proponentsSharePercentage: {
    "ui:widget": "CalculatedValueWidget",
    numberOfDecimalPlaces: 2,
    isPercentage: true,
    calculatedValueFormContextProperty: "calculatedProponentsSharePercentage",
    hideOptional: true,
  },
  anticipatedFundingAmount: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  anticipatedFundingAmountPerFiscalYear: {
    // items: {
    //   "ui:widget": "ReadOnlyWidget",
    //   isMoney: true,
    // },
    items: {
      brianna: {
        "ui:widget": "text",
        calculatedValueFormContextProperty: "calculatedAnticipatedAmount",
      },
    },
    "ui:options": {
      addable: false,
      orderable: false,
      removable: false,
      label: false,
    },
  },
  proponentCost: {
    "ui:widget": "NumberWidget",
    isMoney: true,
  },
  contractStartDate: {
    "ui:widget": "DateWidget",
  },
  projectAssetsLifeEndDate: {
    "ui:widget": "DateWidget",
  },
};
