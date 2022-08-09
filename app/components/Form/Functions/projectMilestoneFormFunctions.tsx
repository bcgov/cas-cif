import {
  milestoneReportingRequirementSchema,
  milestoneSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { milestoneReportingRequirementUiSchema } from "data/jsonSchemaForm/projectMilestoneSchema";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/**
  This function ingests all the sets of form_change edges that are required to render a milestone report. It matches
  milestone & payment form_change records to a reporting_requirement form_change record by the reportingRequirementId field &
  consolidates those records into a consolidated object. This function then returns a set of those consolidated objects.

  @param {Object[]} reportingRequirementEdges - The set of edges from form_changes for the reporting_requirement table
  @param {Object[]} milestoneEdges - The set of edges from form_changes for the milestone_report table
  @param {Object[]} paymentEdges - The set of edges from form_changes for the payment table
  @returns {Object[]} consolidatedFormDataArray - The set of consolidated form_change data objects. Each Object contains matched
  form_changes for the reporting_requirement, milestone_report and payment tables.
*/

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

export const createMilestoneSchema = (reportType?: String) => {
  const schema = JSON.parse(JSON.stringify(milestoneSchema));
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

  if (reportType === "Reporting Milestone") {
    delete schema.properties.totalEligibleExpenses;
    delete schema.properties.maximumAmount;
  }
  if (reportType !== "Reporting Milestone") {
    schema.properties.totalEligibleExpenses = {
      type: "number",
      title: "Total Eligible Expenses",
      default: undefined,
    };
    schema.properties.maximumAmount = {
      type: "number",
      title: "Maximum Amount",
      default: undefined,
    };
  }

  return schema as JSONSchema7;
};

export const createCustomMilestoneReportingRequirementUiSchema = () => {
  return {
    ...milestoneReportingRequirementUiSchema,
    submittedDate: {
      ...milestoneReportingRequirementUiSchema.submittedDate,
      contentPrefix: (
        <div>
          <span style={{ marginRight: "1em" }}>Received</span>
          <FontAwesomeIcon icon={faCheck} color={"green"} />
        </div>
      ),
    },
  };
};
