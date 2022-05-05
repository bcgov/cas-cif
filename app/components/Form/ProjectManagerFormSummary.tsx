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

  const allFormChangesPristine = useMemo(
    () =>
      !allProjectManagerFormChangesByLabel.edges.some(
        ({ node }) =>
          node.formChange?.isPristine === false ||
          node.formChange?.isPristine === null
      ),
    [allProjectManagerFormChangesByLabel.edges]
  );

  const managersJSX = useMemo(() => {
    return allProjectManagerFormChangesByLabel.edges
      .filter(
        ({ node }) =>
          node.formChange?.isPristine === false ||
          node.formChange?.isPristine === null
      )
      .map(({ node }) => {
        if (!node?.formChange) return;

        // Set custom rjsf fields to display diffs
        const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

        return (
          <FormBase
            liveValidate
            key={node.formChange.newFormData.projectManagerLabelId}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={isFirstRevision ? fields : customFields}
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
  }, [allProjectManagerFormChangesByLabel.edges, isFirstRevision]);

  return (
    <>
      <h3>Project Managers</h3>
      {allFormChangesPristine ? (
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
