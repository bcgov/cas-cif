import projectSchema from "data/jsonSchemaForm/projectSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { graphql, useFragment } from "react-relay";
import { ProjectFormSummary_projectRevision$key } from "__generated__/ProjectFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { createProjectUiSchema } from "./ProjectForm";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { getSchemaAndDataIncludingCalculatedValues } from "lib/theme/schemaFilteringHelpers";
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
  const {
    projectFormChange,
    isFirstRevision,
    latestCommittedProjectFormChanges,
  } = useFragment(
    graphql`
      fragment ProjectFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        projectFormChange {
          rank
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
        }
        latestCommittedProjectFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "project"
        ) {
          edges {
            node {
              rank
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
      }
    `,
    projectRevision
  );

  const latestCommittedData = {
    ...latestCommittedProjectFormChanges?.edges[0]?.node?.newFormData,
    rank: latestCommittedProjectFormChanges?.edges[0]?.node?.rank,
  };

  // Show diff if it is not the first revision and not view only (rendered from the overview page)
  const renderDiff = !isFirstRevision && !viewOnly;

  const newDataAsProject = projectFormChange.asProject;

  const latestCommittedAsProject = latestCommittedProjectFormChanges?.edges[0]?.node?.asProject
  const latestCommittedUiSchema = latestCommittedAsProject
    ? createProjectUiSchema(
        latestCommittedAsProject.operatorByOperatorId.legalName,
        `${latestCommittedAsProject?.fundingStreamRfpByFundingStreamRfpId?.fundingStreamByFundingStreamId.description} - ${latestCommittedAsProject?.fundingStreamRfpByFundingStreamRfpId?.year}`,
        latestCommittedAsProject.operatorByOperatorId.bcRegistryId,
        latestCommittedAsProject.projectStatusByProjectStatusId.name
      )
    : null;

  // Set the formSchema and formData based on showing the diff or not
  const { formSchema, formData } = !renderDiff
    ? {
        formSchema: projectSchema,
        formData: projectFormChange.newFormData,
      }
    : {
        ...getSchemaAndDataIncludingCalculatedValues(
          projectSchema as JSONSchema7,

          { ...projectFormChange?.newFormData, rank: projectFormChange.rank },
          latestCommittedData,
          {
            rank: {
              type: "number",
              title: "Rank",
            },
          }
        ),
      };

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  const projectFormNotUpdated = useMemo(
    () =>
      projectFormChange.isPristine ||
      (projectFormChange.isPristine === null &&
        Object.keys(formData).length === 0),
    [projectFormChange, formData]
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
      {projectFormNotUpdated && !viewOnly ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Overview"
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
            calculatedRank: projectFormChange.rank,
            latestCommittedData,
            latestCommittedUiSchema,
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
