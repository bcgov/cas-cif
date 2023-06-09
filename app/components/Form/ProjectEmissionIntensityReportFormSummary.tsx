import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getSchemaAndDataIncludingCalculatedValues } from "lib/theme/schemaFilteringHelpers";
import { ProjectEmissionIntensityReportFormSummary_projectRevision$key } from "__generated__/ProjectEmissionIntensityReportFormSummary_projectRevision.graphql";
import { createEmissionIntensityReportUiSchema } from "./ProjectEmissionIntensityReportForm";
import { SummaryFormProps } from "data/formPages/types";
import { useEffect, useMemo } from "react";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";
const { fields } = utils.getDefaultRegistry();

interface Props
  extends SummaryFormProps<ProjectEmissionIntensityReportFormSummary_projectRevision$key> {}

const ProjectEmissionsIntensityReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const {
    summaryEmissionIntensityReportingRequirementFormChange,
    isFirstRevision,
    latestCommittedEmissionIntensityReportFormChange,
  } = useFragment(
    graphql`
      fragment ProjectEmissionIntensityReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryEmissionIntensityReportingRequirementFormChange: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "TEIMP"
        ) {
          edges {
            node {
              calculatedEiPerformance
              paymentPercentage
              holdbackAmountToDate
              actualPerformanceMilestoneAmount
              newFormData
              operation
              isPristine
              formByJsonSchemaName {
                jsonSchema
              }
              formChangeByPreviousFormChangeId {
                newFormData
                calculatedEiPerformance
                paymentPercentage
                holdbackAmountToDate
                actualPerformanceMilestoneAmount
              }
            }
          }
        }
        latestCommittedEmissionIntensityReportFormChange: latestCommittedFormChangesFor(
          formDataTableName: "emission_intensity_report"
        ) {
          edges {
            node {
              newFormData
              calculatedEiPerformance
              paymentPercentage
              holdbackAmountToDate
              actualPerformanceMilestoneAmount
            }
          }
        }
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !viewOnly;

  const summaryReportingRequirement =
    summaryEmissionIntensityReportingRequirementFormChange?.edges[0]?.node;

  const newData = {
    ...summaryReportingRequirement?.newFormData,
    //calculated values
    calculatedEiPerformance:
      summaryReportingRequirement?.calculatedEiPerformance,
    paymentPercentage: summaryReportingRequirement?.paymentPercentage,
    holdbackAmountToDate: summaryReportingRequirement?.holdbackAmountToDate,
    actualPerformanceMilestoneAmount:
      summaryReportingRequirement?.actualPerformanceMilestoneAmount,
  };

  const oldData = {
    ...summaryReportingRequirement?.formChangeByPreviousFormChangeId
      ?.newFormData,
    //calculated values
    calculatedEiPerformance:
      summaryReportingRequirement?.formChangeByPreviousFormChangeId
        ?.calculatedEiPerformance,
    paymentPercentage:
      summaryReportingRequirement?.formChangeByPreviousFormChangeId
        ?.paymentPercentage,
    holdbackAmountToDate:
      summaryReportingRequirement?.formChangeByPreviousFormChangeId
        ?.holdbackAmountToDate,
    actualPerformanceMilestoneAmount:
      summaryReportingRequirement?.formChangeByPreviousFormChangeId
        ?.actualPerformanceMilestoneAmount,
  };

  const latestCommittedData = {
    ...latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
      ?.newFormData,
    //calculated values
    calculatedEiPerformance:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.calculatedEiPerformance,
    paymentPercentage:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.paymentPercentage,
    holdbackAmountToDate:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.holdbackAmountToDate,
    actualPerformanceMilestoneAmount:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.actualPerformanceMilestoneAmount,
  };

  const allFormChangesPristine = useMemo(() => {
    if (
      summaryReportingRequirement?.isPristine === false ||
      summaryReportingRequirement?.isPristine === null
    )
      return false;
    return true;
  }, [summaryReportingRequirement?.isPristine]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  if (isOnAmendmentsAndOtherRevisionsPage && allFormChangesPristine)
    return null;

  if ((allFormChangesPristine && !viewOnly) || !summaryReportingRequirement)
    return (
      <>
        {!isOnAmendmentsAndOtherRevisionsPage && (
          <h3>Emission Intensity Report</h3>
        )}
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Emission Intensity Report"
        />
      </>
    );

  // Set the formSchema and formData based on showing the diff or not
  const reportingRequirementDiffObject = !renderDiff
    ? {
        formSchema: summaryReportingRequirement.formByJsonSchemaName.jsonSchema
          .schema as JSONSchema7,
        formData: summaryReportingRequirement?.newFormData,
      }
    : getSchemaAndDataIncludingCalculatedValues(
        summaryReportingRequirement.formByJsonSchemaName.jsonSchema
          ?.schema as JSONSchema7,
        newData,
        oldData,
        {
          // This is only to add the (Adjusted) to the title of the field to differentiate it from the calculated field
          adjustedEmissionsIntensityPerformance: {
            title: "GHG Emission Intensity Performance (Adjusted)",
            type: "number",
          },
          // Add calculatedEiPerformance to the schema since this field is using `AdjustableCalculatedValueWidget` and is not directly in the schema
          calculatedEiPerformance: {
            type: "number",
            title: "GHG Emission Intensity Performance",
          },
        }
      );

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  let modifiedEmissionIntensityReportUiSchema =
    createEmissionIntensityReportUiSchema(
      summaryReportingRequirement?.newFormData?.emissionFunctionalUnit,
      summaryReportingRequirement?.newFormData?.productionFunctionalUnit,
      summaryReportingRequirement?.newFormData?.measurementPeriodStartDate,
      summaryReportingRequirement?.newFormData?.measurementPeriodEndDate,
      false
    );

  // To show the calculatedEiPerformance field in the diff view with proper formatting
  if (renderDiff)
    modifiedEmissionIntensityReportUiSchema = {
      ...modifiedEmissionIntensityReportUiSchema,
      calculatedValues: {
        calculatedEiPerformance: {
          "ui:widget": "NumberWidget",
          hideOptional: true,
          isPercentage: true,
          numberOfDecimalPlaces: 2,
        },
      },
    };

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Emission Intensity Report</h3>
      )}
      {/* Show this part if none of the emission intensity report form properties have been updated */}
      {allFormChangesPristine &&
        !viewOnly &&
        summaryReportingRequirement?.operation !== "ARCHIVE" && (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Emission Intensity Report"
          />
        )}
      {/* Show this part if the whole emission intensity report has been removed */}
      {renderDiff && summaryReportingRequirement?.operation === "ARCHIVE" && (
        <FormRemoved
          isOnAmendmentsAndOtherRevisionsPage={
            isOnAmendmentsAndOtherRevisionsPage
          }
          formTitle="Emission Intensity Report"
        />
      )}

      <FormBase
        tagName={"dl"}
        theme={readOnlyTheme}
        fields={renderDiff ? customFields : fields}
        schema={reportingRequirementDiffObject.formSchema as JSONSchema7}
        uiSchema={modifiedEmissionIntensityReportUiSchema}
        formData={reportingRequirementDiffObject.formData}
        formContext={{
          calculatedEiPerformance:
            summaryReportingRequirement?.calculatedEiPerformance ?? 0,
          paymentPercentageOfPerformanceMilestoneAmount:
            summaryReportingRequirement?.paymentPercentage,
          holdbackAmountToDate:
            summaryReportingRequirement?.holdbackAmountToDate,
          actualPerformanceMilestoneAmount:
            summaryReportingRequirement?.actualPerformanceMilestoneAmount,
          operation: summaryReportingRequirement?.operation,
          oldData,
          latestCommittedData,
          isAmendmentsAndOtherRevisionsSpecific:
            isOnAmendmentsAndOtherRevisionsPage,
        }}
      />
    </>
  );
};

export default ProjectEmissionsIntensityReportFormSummary;
