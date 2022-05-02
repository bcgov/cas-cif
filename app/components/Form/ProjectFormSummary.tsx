import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";
import CUSTOM_FIELDS from "lib/theme/CustomFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
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
        `${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId.description} - ${previousDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
        previousDataAsProject.projectStatusByProjectStatusId.name
      )
    : null;

  // Filter out fields from the formData that have not changed from the previous revision so the summary ignores these fields
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

  // Filter out fields from the schema that have not been changed when creating a project so the summary ignores these fields
  useMemo(() => {
    if (projectFormChange.operation === "CREATE")
      for (const [key] of Object.entries(filteredSchema.properties)) {
        if (key in filteredFormData) continue;
        else delete filteredSchema.properties[key];
      }
  }, [
    filteredFormData,
    filteredSchema.properties,
    projectFormChange.operation,
  ]);

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_FIELDS };

  return (
    <>
      <h3>Project Overview</h3>
      {projectFormChange.isPristine ||
      (projectFormChange.isPristine === null &&
        projectFormChange.newFormData === {}) ? (
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
            newDataAsProject?.operatorByOperatorId?.legalName,
            newDataAsProject?.operatorByOperatorId?.bcRegistryId,
            `${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId?.description} - ${newDataAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
            newDataAsProject?.projectStatusByProjectStatusId?.name
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
