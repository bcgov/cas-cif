import { createProjectManagerUiSchema } from "components/Form/ProjectManagerForm";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormSummary_projectRevision$key } from "__generated__/ProjectManagerFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { SummaryFormProps } from "data/formPages/types";
import { FormNotAddedOrUpdated } from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

interface Props
  extends SummaryFormProps<ProjectManagerFormSummary_projectRevision$key> {}

const ProjectManagerFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const { projectManagerFormChangesByLabel, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectManagerFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        projectManagerFormChangesByLabel {
          edges {
            node {
              formChange {
                newFormData
                isPristine
                operation
                asProjectManager {
                  cifUserByCifUserId {
                    fullName
                  }
                }
                formChangeByPreviousFormChangeId {
                  newFormData
                  asProjectManager {
                    cifUserByCifUserId {
                      fullName
                    }
                  }
                }
              }
              projectManagerLabel {
                label
              }
            }
          }
        }
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the managers page)
  const renderDiff = !isFirstRevision && !viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived managers
  let managerFormChanges = projectManagerFormChangesByLabel.edges;
  if (!renderDiff)
    managerFormChanges = projectManagerFormChangesByLabel.edges.filter(
      ({ node }) => node?.formChange?.operation !== "ARCHIVE"
    );

  const allFormChangesPristine = useMemo(
    () =>
      !managerFormChanges.some(
        ({ node }) =>
          node.formChange?.isPristine === false ||
          node.formChange?.isPristine === null
      ),
    [managerFormChanges]
  );

  let formChangesByLabel = managerFormChanges;
  if (!viewOnly)
    formChangesByLabel = managerFormChanges.filter(
      ({ node }) =>
        node.formChange?.isPristine === false ||
        node.formChange?.isPristine === null
    );

  const managersJSX = useMemo(() => {
    return formChangesByLabel.map(({ node }) => {
      if (!node?.formChange) return;

      // Set custom rjsf fields to display diffs
      const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

      return (
        <FormBase
          liveValidate
          key={node.formChange.newFormData.projectManagerLabelId}
          tagName={"dl"}
          theme={readOnlyTheme}
          fields={renderDiff ? customFields : fields}
          schema={projectManagerSchema as JSONSchema7}
          uiSchema={createProjectManagerUiSchema(
            node.formChange?.asProjectManager?.cifUserByCifUserId?.fullName,
            node.projectManagerLabel.label
          )}
          formData={node.formChange.newFormData}
          formContext={{
            operation: node.formChange?.operation,
            oldData:
              node.formChange?.formChangeByPreviousFormChangeId?.newFormData,
            oldUiSchema: createProjectManagerUiSchema(
              node.formChange?.formChangeByPreviousFormChangeId
                ?.asProjectManager?.cifUserByCifUserId?.fullName
            ),
            isAmendmentsAndOtherRevisionsSpecific:
              isOnAmendmentsAndOtherRevisionsPage,
          }}
        />
      );
    });
  }, [formChangesByLabel, renderDiff, isOnAmendmentsAndOtherRevisionsPage]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  if (isOnAmendmentsAndOtherRevisionsPage && allFormChangesPristine)
    return null;

  return (
    <>
      <h3>Project Managers</h3>
      {allFormChangesPristine &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          text="Project Managers"
        />
      ) : (
        managersJSX
      )}
    </>
  );
};

export default ProjectManagerFormSummary;
