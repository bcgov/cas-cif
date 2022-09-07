import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";

const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectFormSummary: React.FC<Props> = (props) => {
  const { projectFormChange, isFirstRevision, rank } = useFragment(
    graphql`
      fragment ProjectFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        rank
        projectFormChange {
          newFormData
          operation
          isPristine
          asProject {
            operatorByOperatorId {
              legalName
              bcRegistryId
            }
            fundingStreamRfpByFundingStreamRfpId {
              year
              fundingStreamByFundingStreamId {
                description
              }
            }
            projectStatusByProjectStatusId {
              name
            }
          }
          formChangeByPreviousFormChangeId {
            newFormData
            asProject {
              operatorByOperatorId {
                legalName
                bcRegistryId
              }
              fundingStreamRfpByFundingStreamRfpId {
                year
                fundingStreamByFundingStreamId {
                  description
                }
              }
              projectStatusByProjectStatusId {
                name
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

  const newDataAsProject = projectFormChange.asProject;
  const previousDataAsProject =
    projectFormChange.formChangeByPreviousFormChangeId?.asProject;

  const oldUiSchema = previousDataAsProject
    ? createProjectUiSchema(
        previousDataAsProject.operatorByOperatorId.legalName,
        previousDataAsProject.operatorByOperatorId.bcRegistryId,
        `${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId.description} - ${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
        previousDataAsProject.projectStatusByProjectStatusId.name
      )
    : null;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: projectSchema,
        formData: projectFormChange.newFormData,
      }
    : getFilteredSchema(projectSchema as JSONSchema7, projectFormChange);

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  return (
    <>
      <h3>Project Overview</h3>
      {(projectFormChange.isPristine ||
        (projectFormChange.isPristine === null &&
          Object.keys(projectFormChange.newFormData).length === 0)) &&
      !props.viewOnly ? (
        <p>
          <em>Project overview not {isFirstRevision ? "added" : "updated"}</em>
        </p>
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={renderDiff ? customFields : fields}
          schema={formSchema as JSONSchema7}
          uiSchema={createProjectUiSchema(
            newDataAsProject?.operatorByOperatorId?.legalName,
            newDataAsProject?.operatorByOperatorId?.bcRegistryId,
            `${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId?.description} - ${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
            newDataAsProject?.projectStatusByProjectStatusId?.name
          )}
          formData={formData}
          formContext={{
            calculatedRank: rank,
            oldData:
              projectFormChange.formChangeByPreviousFormChangeId?.newFormData,
            oldUiSchema,
            operation: projectFormChange.operation,
          }}
        />
      )}
    </>
  );
};

export default ProjectFormSummary;
