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
import { ProjectEmissionIntensityReportFormSummary_query$key } from "__generated__/ProjectEmissionIntensityReportFormSummary_query.graphql";
const { fields } = utils.getDefaultRegistry();

interface Props
  extends SummaryFormProps<ProjectEmissionIntensityReportFormSummary_projectRevision$key> {
  query: ProjectEmissionIntensityReportFormSummary_query$key;
}

const ProjectEmissionsIntensityReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
  query,
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
              maximumPerformanceMilestoneAmount
              actualPerformanceMilestoneAmount
              newFormData
              operation
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        latestCommittedEmissionIntensityReportFormChange: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "TEIMP"
        ) {
          edges {
            node {
              newFormData
              calculatedEiPerformance
              paymentPercentage
              maximumPerformanceMilestoneAmount
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
    maximumPerformanceMilestoneAmount:
      summaryReportingRequirement?.maximumPerformanceMilestoneAmount,
    actualPerformanceMilestoneAmount:
      summaryReportingRequirement?.actualPerformanceMilestoneAmount,
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
    maximumPerformanceMilestoneAmount:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.maximumPerformanceMilestoneAmount,
    actualPerformanceMilestoneAmount:
      latestCommittedEmissionIntensityReportFormChange?.edges[0]?.node
        ?.actualPerformanceMilestoneAmount,
  };

  const { emissionIntensityFormBySlug } = useFragment(
    graphql`
      fragment ProjectEmissionIntensityReportFormSummary_query on Query {
        emissionIntensityFormBySlug: formBySlug(slug: "emission_intensity") {
          jsonSchema
        }
      }
    `,
    query
  );

  const filteredSchema = getSchemaAndDataIncludingCalculatedValues(
    emissionIntensityFormBySlug.jsonSchema.schema as JSONSchema7,
    newData,
    latestCommittedData,
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

  const allFormChangesPristine = useMemo(
    () => Object.keys(filteredSchema.formData).length === 0,
    [filteredSchema.formData]
  );

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
    : filteredSchema;

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
          maximumPerformanceMilestoneAmount:
            summaryReportingRequirement?.maximumPerformanceMilestoneAmount,
          actualPerformanceMilestoneAmount:
            summaryReportingRequirement?.actualPerformanceMilestoneAmount,
          operation: summaryReportingRequirement?.operation,
          latestCommittedData,
          isAmendmentsAndOtherRevisionsSpecific:
            isOnAmendmentsAndOtherRevisionsPage,
        }}
      />
      <style jsx>{`
        :global(.adjustable-calculated-value-widget) {
          display: flex;
          flex-wrap: wrap;
        }
      `}</style>
    </>
  );
};

export default ProjectEmissionsIntensityReportFormSummary;
