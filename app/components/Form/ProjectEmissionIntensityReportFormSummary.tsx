import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import {
  emissionIntensityReportSchema,
  emissionIntensityReportingRequirementSchema,
  emissionIntensityReportingRequirementUiSchema,
} from "data/jsonSchemaForm/projectEmissionIntensitySchema";
import { ProjectEmissionIntensityReportFormSummary_projectRevision$key } from "__generated__/ProjectEmissionIntensityReportFormSummary_projectRevision.graphql";
import useShowGrowthbookFeature from "lib/growthbookWrapper";
import { createEmissionIntensityReportUiSchema } from "./ProjectEmissionIntensityReportForm";
import { SummaryFormProps } from "data/formPages/types";
import { useEffect, useMemo } from "react";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";
import { getFilteredEmissionIntensitySchema } from "lib/theme/getFilteredEmissionIntensitySchema";
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
    summaryEmissionIntensityReportFormChange,
    summaryEmissionIntensityReportingRequirementFormChange,
    isFirstRevision,
    latestCommittedEmissionIntensityReportingRequirementFormChange,
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
              newFormData
              operation
              isPristine
              formChangeByPreviousFormChangeId {
                newFormData
              }
            }
          }
        }
        summaryEmissionIntensityReportFormChange: formChangesFor(
          formDataTableName: "emission_intensity_report"
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
        latestCommittedEmissionIntensityReportingRequirementFormChange: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "TEIMP"
        ) {
          edges {
            node {
              newFormData
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

  const summaryEmissionIntensityReport =
    summaryEmissionIntensityReportFormChange?.edges[0]?.node;

  const oldData = {
    ...summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
      ?.newFormData,
    //calculated values
    calculatedEiPerformance:
      summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
        ?.calculatedEiPerformance,
    paymentPercentage:
      summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
        ?.paymentPercentage,
    holdbackAmountToDate:
      summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
        ?.holdbackAmountToDate,
    actualPerformanceMilestoneAmount:
      summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
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

  // Set the formSchema and formData based on showing the diff or not
  const reportingRequirementDiffObject = !renderDiff
    ? {
        formSchema: emissionIntensityReportingRequirementSchema,
        formData: summaryReportingRequirement?.newFormData,
      }
    : getFilteredSchema(
        emissionIntensityReportingRequirementSchema as JSONSchema7,
        summaryReportingRequirement || {}
      );

  const emissionIntensityReportDiffObject = !renderDiff
    ? {
        formSchema: emissionIntensityReportSchema,
        formData: summaryEmissionIntensityReport?.newFormData,
      }
    : getFilteredEmissionIntensitySchema(
        {
          ...emissionIntensityReportSchema,
          properties: {
            ...emissionIntensityReportSchema.properties,
            // This is only to add the (Adjusted) to the title of the field to differentiate it from the calculated field
            uponCompletion: {
              ...emissionIntensityReportSchema.properties.uponCompletion,
              properties: {
                ...emissionIntensityReportSchema.properties.uponCompletion
                  .properties,
                adjustedEmissionsIntensityPerformance: {
                  title: "GHG Emission Intensity Performance (Adjusted)",
                  type: "number",
                },
              },
            },
            // Add calculatedEiPerformance to the schema since this field is using `AdjustableCalculatedValueWidget` and is not directly in the schema
            calculatedValues: {
              properties: {
                calculatedEiPerformance: {
                  type: "number",
                  title: "GHG Emission Intensity Performance",
                },
              },
            },
          },
        } as JSONSchema7,
        summaryEmissionIntensityReport || {}
      );

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  const allFormChangesPristine = useMemo(() => {
    if (
      summaryEmissionIntensityReport?.isPristine === false ||
      summaryReportingRequirement?.isPristine === false ||
      summaryEmissionIntensityReport?.isPristine === null ||
      summaryReportingRequirement?.isPristine === null
    )
      return false;
    return true;
  }, [
    summaryEmissionIntensityReport?.isPristine,
    summaryReportingRequirement?.isPristine,
  ]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  // Growthbook - teimp
  if (!useShowGrowthbookFeature("teimp")) return null;

  if (isOnAmendmentsAndOtherRevisionsPage && allFormChangesPristine)
    return null;

  if (
    (allFormChangesPristine && !viewOnly) ||
    (!summaryReportingRequirement && !summaryEmissionIntensityReport)
  )
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

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Emission Intensity Report</h3>
      )}
      {/* Show this part if none of the emission intensity report form properties have been updated */}
      {allFormChangesPristine &&
        !viewOnly &&
        summaryEmissionIntensityReport?.operation !== "ARCHIVE" && (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Emission Intensity Report"
          />
        )}
      {/* Show this part if the whole emission intensity report has been removed */}
      {renderDiff &&
        summaryEmissionIntensityReport?.operation === "ARCHIVE" && (
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
        uiSchema={emissionIntensityReportingRequirementUiSchema}
        formData={reportingRequirementDiffObject.formData}
        formContext={{
          operation: summaryReportingRequirement?.operation,
          oldData:
            summaryReportingRequirement?.formChangeByPreviousFormChangeId
              ?.newFormData,
          latestCommittedData:
            latestCommittedEmissionIntensityReportingRequirementFormChange
              ?.edges[0]?.node?.newFormData,
          isAmendmentsAndOtherRevisionsSpecific:
            isOnAmendmentsAndOtherRevisionsPage,
        }}
      />
      <FormBase
        tagName={"dl"}
        theme={readOnlyTheme}
        fields={renderDiff ? customFields : fields}
        schema={emissionIntensityReportDiffObject.formSchema as JSONSchema7}
        uiSchema={createEmissionIntensityReportUiSchema(
          summaryEmissionIntensityReport?.newFormData?.emissionFunctionalUnit,
          summaryEmissionIntensityReport?.newFormData?.productionFunctionalUnit,
          summaryEmissionIntensityReport?.newFormData
            ?.measurementPeriodStartDate,
          summaryEmissionIntensityReport?.newFormData?.measurementPeriodEndDate,
          false
        )}
        formData={emissionIntensityReportDiffObject.formData}
        formContext={{
          calculatedEiPerformance:
            summaryEmissionIntensityReport?.calculatedEiPerformance ?? 0,
          paymentPercentageOfPerformanceMilestoneAmount:
            summaryEmissionIntensityReport?.paymentPercentage,
          maximumPerformanceMilestoneAmount:
            summaryEmissionIntensityReport?.holdbackAmountToDate,
          actualPerformanceMilestoneAmount:
            summaryEmissionIntensityReport?.actualPerformanceMilestoneAmount,
          operation: summaryEmissionIntensityReport?.operation,
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
