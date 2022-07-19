import fundingAgreementSchema from "data/jsonSchemaForm/fundingAgreementSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import { ProjectEmissionsIntensityReportForm_projectRevision$key } from "__generated__/ProjectEmissionsIntensityReportForm_projectRevision.graphql";
import ProjectEmissionsIntensityReportForm from "./ProjectEmissionsIntensityReportForm";

const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectEmissionsIntensityReportForm_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectEmissionsIntensityReportFormSummary: React.FC<Props> = (props) => {
  const { summaryProjectFundingAgreementFormChanges, isFirstRevision } =
    useFragment(
      graphql`
        fragment ProjectEmissionsIntensityReportFormSummary_projectRevision on ProjectRevision {
          isFirstRevision
          summaryProjectFundingAgreementFormChanges: formChangesFor(
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

  const fundingAgreementSummary =
    summaryProjectFundingAgreementFormChanges.edges[0]?.node;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: fundingAgreementSchema,
        formData: fundingAgreementSummary?.newFormData,
      }
    : getFilteredSchema(
        fundingAgreementSchema as JSONSchema7,
        fundingAgreementSummary || {}
      );

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  return (
    <>
      <h3>Project Funding Agreement</h3>
      {(!fundingAgreementSummary ||
        fundingAgreementSummary?.isPristine ||
        (fundingAgreementSummary?.isPristine === null &&
          Object.keys(fundingAgreementSummary?.newFormData).length === 0)) &&
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
            operation: fundingAgreementSummary?.operation,
            oldData:
              fundingAgreementSummary?.formChangeByPreviousFormChangeId
                ?.newFormData,
          }}
        />
      )}
    </>
  );
};

export default ProjectEmissionsIntensityReportFormSummary;
