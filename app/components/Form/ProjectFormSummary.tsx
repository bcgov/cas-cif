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
import { SummaryFormProps } from "data/formPages/types";
import { useEffect, useMemo } from "react";
import { FormNotAddedOrUpdated } from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

interface Props
  extends SummaryFormProps<ProjectFormSummary_projectRevision$key> {}

const ProjectFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
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
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !viewOnly;

  const newDataAsProject = projectFormChange.asProject;
  const previousDataAsProject =
    projectFormChange.formChangeByPreviousFormChangeId?.asProject;

  const oldUiSchema = previousDataAsProject
    ? createProjectUiSchema(
        previousDataAsProject.operatorByOperatorId.legalName,
        `${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId.description} - ${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
        previousDataAsProject.operatorByOperatorId.bcRegistryId,
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

  const projectFormNotUpdated = useMemo(
    () => projectFormChange.isPristine === null || projectFormChange.isPristine,
    [projectFormChange]
  );
  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!projectFormNotUpdated),
    [projectFormNotUpdated, setHasDiff]
  );

  if (isOnAmendmentsAndOtherRevisionsPage && projectFormNotUpdated) return null;

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Overview</h3>}
      {(projectFormChange.isPristine ||
        (projectFormChange.isPristine === null &&
          Object.keys(projectFormChange.newFormData).length === 0)) &&
      !viewOnly ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          text="Project Overview"
        />
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={renderDiff ? customFields : fields}
          schema={formSchema as JSONSchema7}
          uiSchema={createProjectUiSchema(
            newDataAsProject?.operatorByOperatorId?.legalName,
            `${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId?.description} - ${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
            newDataAsProject?.operatorByOperatorId?.bcRegistryId,
            newDataAsProject?.projectStatusByProjectStatusId?.name
          )}
          formData={formData}
          formContext={{
            calculatedRank: rank,
            oldData:
              projectFormChange.formChangeByPreviousFormChangeId?.newFormData,
            oldUiSchema,
            operation: projectFormChange.operation,
            isAmendmentsAndOtherRevisionsSpecific:
              isOnAmendmentsAndOtherRevisionsPage,
          }}
        />
      )}
    </>
  );
};

export default ProjectFormSummary;
