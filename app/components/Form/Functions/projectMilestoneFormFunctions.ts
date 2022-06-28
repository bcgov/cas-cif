import {
  milestoneReportingRequirementSchema,
  milestoneSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";

export const getConsolidatedMilestoneFormData = (
  reportingRequirementEdges,
  milestoneEdges,
  paymentEdges
) => {
  const consolidatedFormDataArray = [];
  let consolidatedFormDataObject = {} as any;

  reportingRequirementEdges.forEach((reportingRequirement) => {
    consolidatedFormDataObject.reportingRequirementFormChange =
      reportingRequirement.node;
    // We simulate a node object here for each array item to allow the getSortedReports() function to sort this consolidated data
    consolidatedFormDataObject.operation = reportingRequirement.node.operation;
    consolidatedFormDataObject.reportingRequirementIndex =
      reportingRequirement.node.newFormData.reportingRequirementIndex;

    consolidatedFormDataObject.milestoneFormChange = milestoneEdges.find(
      ({ node }) =>
        reportingRequirement.node.formDataRecordId ===
        node.newFormData?.reportingRequirementId
    )?.node;
    consolidatedFormDataObject.paymentFormChange = paymentEdges.find(
      ({ node }) =>
        reportingRequirement.node.formDataRecordId ===
        node.newFormData?.reportingRequirementId
    )?.node;
    consolidatedFormDataArray.push(consolidatedFormDataObject);
    consolidatedFormDataObject = {};
  });
  return consolidatedFormDataArray;
};

export const createMilestoneReportingRequirementSchema = (allReportTypes) => {
  const schema = milestoneReportingRequirementSchema;
  schema.properties.reportType = {
    ...schema.properties.reportType,
    anyOf: allReportTypes.edges.map(({ node }) => {
      const replaceRegex = /\sMilestone/i;
      const displayValue = node.name.replace(replaceRegex, "");
      return {
        type: "string",
        title: displayValue,
        enum: [node.name],
        value: node.name,
      } as JSONSchema7Definition;
    }),
    default: "General Milestone",
  };
  return schema as JSONSchema7;
};

export const createMilestoneSchema = () => {
  const schema = milestoneSchema;
  schema.properties.certifierProfessionalDesignation = {
    ...schema.properties.certifierProfessionalDesignation,
    anyOf: ["Professional Engineer", "Certified Professional Accountant"].map(
      (designation) => {
        return {
          type: "string",
          title: designation,
          enum: [designation],
          value: designation,
        } as JSONSchema7Definition;
      }
    ),
  };

  return schema as JSONSchema7;
};
