import { createProjectManagerUiSchema } from "components/Form/ProjectManagerForm";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormSummary_projectRevision$key } from "__generated__/ProjectManagerFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";

const { fields } = utils.getDefaultRegistry();

interface Props {
  projectRevision: ProjectManagerFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectManagerFormSummary: React.FC<Props> = (props) => {
  const { allProjectManagerFormChangesByLabel, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectManagerFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        allProjectManagerFormChangesByLabel {
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
    props.projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the managers page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  const allFormChangesPristine = useMemo(
    () =>
      !allProjectManagerFormChangesByLabel.edges.some(
        ({ node }) =>
          node.formChange?.isPristine === false ||
          node.formChange?.isPristine === null
      ),
    [allProjectManagerFormChangesByLabel.edges]
  );

  let formChangesByLabel = allProjectManagerFormChangesByLabel.edges;
  if (!props.viewOnly)
    formChangesByLabel = allProjectManagerFormChangesByLabel.edges.filter(
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
          }}
        />
      );
    });
  }, [formChangesByLabel, renderDiff]);

  return (
    <>
      <h3>Project Managers</h3>
      {allFormChangesPristine && !props.viewOnly ? (
        <p>
          <em>Project managers not {isFirstRevision ? "added" : "updated"}</em>
        </p>
      ) : (
        managersJSX
      )}
    </>
  );
};

export default ProjectManagerFormSummary;
