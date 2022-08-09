import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import { useMemo } from "react";
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
const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectEmissionIntensityReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectEmissionsIntensityReportFormSummary: React.FC<Props> = (props) => {
  const {
    summaryEmissionIntensityReportFormChange,
    summaryEmissionIntensityReportingRequirementFormChange,
    isFirstRevision,
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
              newFormData
              operation
              isPristine
              formChangeByPreviousFormChangeId {
                newFormData
              }
            }
          }
        }
      }
    `,
    props.projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  const summaryReportingRequirement =
    summaryEmissionIntensityReportingRequirementFormChange?.edges[0]?.node;

  const summaryEmissionIntensityReport =
    summaryEmissionIntensityReportFormChange?.edges[0]?.node;

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
    : getFilteredSchema(
        emissionIntensityReportSchema as JSONSchema7,
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

  // Growthbook - teimp
  if (!useShowGrowthbookFeature("teimp")) return null;

  if (
    allFormChangesPristine ||
    (!summaryReportingRequirement && !summaryEmissionIntensityReport)
  )
    return (
      <>
        <h3>Emission Intensity Report</h3>
        <dd>
          <em>
            Emission Intensity Report not{" "}
            {isFirstRevision ? "added" : "updated"}
          </em>
        </dd>
      </>
    );

  return (
    <>
      <h3>Emission Intensity Report</h3>
      {/* Show this part if none of the emission intensity report form properties have been updated */}
      {allFormChangesPristine &&
        summaryEmissionIntensityReport?.operation !== "ARCHIVE" && (
          <p>
            <em>
              Emission Intensity Report
              {isFirstRevision ? "added" : "updated"}
            </em>
          </p>
        )}
      {/* Show this part if the whole emission intensity report has been removed */}
      {renderDiff &&
        summaryEmissionIntensityReport?.operation === "ARCHIVE" && (
          <em className="diffOld">Emission Intensity Report Removed</em>
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
          operation: summaryEmissionIntensityReport?.operation,
          oldData:
            summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
              ?.newFormData,
        }}
      />
    </>
  );
};

export default ProjectEmissionsIntensityReportFormSummary;
