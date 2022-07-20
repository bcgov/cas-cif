import fundingAgreementSchema from "data/jsonSchemaForm/fundingAgreementSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import { ProjectEmissionsIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionsIntensityReportForm_projectRevision.graphql";
import {
  projectEmissionIntensitySchema,
  emissionIntensityReportingRequirementSchema,
} from "data/jsonSchemaForm/projectEmissionIntensitySchema";
const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectEmissionsIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectEmissionsIntensityReportFormSummary: React.FC<Props> = (props) => {
  const { summaryProjectEmissionIntensityReportFormChanges, isFirstRevision } =
    useFragment(
      graphql`
        fragment ProjectEmissionsIntensityReportFormSummary_projectRevision on ProjectRevision {
          isFirstRevision
          summaryProjectEmissionIntensityReportFormChanges: formChangesFor(
            formDataTableName: "emission_intensity_report"
          ) {
            edges {
              node {
                newFormData
                isPristine
                operation
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

  const summaryEmissionIntensityReport =
    summaryProjectEmissionIntensityReportFormChanges?.edges[0]?.node;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: emissionIntensityReportingRequirementSchema,
        formData: summaryEmissionIntensityReport?.newFormData,
      }
    : getFilteredSchema(
        emissionIntensityReportingRequirementSchema as JSONSchema7,
        projectEmissionIntensitySchema || {}
      );

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  return (
    <>
      <h3>WIP: Fixing.</h3>
      {(!summaryEmissionIntensityReport ||
        summaryEmissionIntensityReport?.isPristine ||
        (summaryEmissionIntensityReport?.isPristine === null &&
          Object.keys(summaryEmissionIntensityReport?.newFormData).length ===
            0)) &&
      !props.viewOnly ? (
        <p>
          <em>Funding agreement not {isFirstRevision ? "added" : "updated"}</em>
        </p>
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={renderDiff ? customFields : fields}
          schema={formSchema as JSONSchema7}
          uiSchema={fundingAgreementSchema}
          formData={formData}
          formContext={{
            operation: summaryEmissionIntensityReport?.operation,
            oldData:
              summaryEmissionIntensityReport?.formChangeByPreviousFormChangeId
                ?.newFormData,
          }}
        />
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReportFormSummary;
