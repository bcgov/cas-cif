import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import { ProjectFormSummary_query$key } from "__generated__/ProjectFormSummary_query.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";
import CUSTOM_FIELDS from "lib/theme/CustomFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
  query: ProjectFormSummary_query$key;
  projectRevision: ProjectFormSummary_projectRevision$key;
}

const ProjectFormSummary: React.FC<Props> = (props) => {
  const { projectFormChange } = useFragment(
    graphql`
      fragment ProjectFormSummary_projectRevision on ProjectRevision {
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

  const newDataAsProject = projectFormChange.asProject;
  const previousDataAsProject =
    projectFormChange.formChangeByPreviousFormChangeId?.asProject;

  const oldUiSchema = previousDataAsProject
    ? createProjectUiSchema(
        previousDataAsProject.operatorByOperatorId.legalName,
        previousDataAsProject.operatorByOperatorId.bcRegistryId,
        `${previousDataAsProject.fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId.description} - ${previousDataAsProject.fundingStreamRfpByFundingStreamRfpId.year}`,
        previousDataAsProject.projectStatusByProjectStatusId.name
      )
    : null;

  // Filter out fields that have not changed from the previous revision
  const filteredSchema = JSON.parse(JSON.stringify(projectSchema));
  const filteredFormData = useMemo(() => {
    const newDataObject = {};
    for (const [key, value] of Object.entries(projectFormChange.newFormData)) {
      if (
        value ===
        projectFormChange.formChangeByPreviousFormChangeId?.newFormData?.[key]
      )
        delete filteredSchema.properties[key];
      else newDataObject[key] = value;
    }
    return newDataObject;
  }, [
    filteredSchema.properties,
    projectFormChange.formChangeByPreviousFormChangeId?.newFormData,
    projectFormChange.newFormData,
  ]);

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_FIELDS };

  return (
    <>
      <h3>Project Overview</h3>
      {projectFormChange.isPristine ? (
        <p>
          <em>Project overview not updated</em>
        </p>
      ) : (
        <FormBase
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={customFields}
          schema={filteredSchema as JSONSchema7}
          uiSchema={createProjectUiSchema(
            newDataAsProject.operatorByOperatorId.legalName,
            newDataAsProject.operatorByOperatorId.bcRegistryId,
            `${newDataAsProject.fundingStreamRfpByFundingStreamRfpId.fundingStreamByFundingStreamId.description} - ${newDataAsProject.fundingStreamRfpByFundingStreamRfpId.year}`,
            newDataAsProject.projectStatusByProjectStatusId.name
          )}
          formData={filteredFormData}
          formContext={{
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
