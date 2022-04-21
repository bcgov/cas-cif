import { createProjectManagerUiSchema } from "components/Form/ProjectManagerForm";
import projectManagerSchema from "data/jsonSchemaForm/projectManagerSchema";
import type { JSONSchema7 } from "json-schema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormSummary_projectRevision$key } from "__generated__/ProjectManagerFormSummary_projectRevision.graphql";
import { ProjectManagerFormSummary_query$key } from "__generated__/ProjectManagerFormSummary_query.graphql";
import FormBase from "./FormBase";

interface Props {
  query: ProjectManagerFormSummary_query$key;
  projectRevision: ProjectManagerFormSummary_projectRevision$key;
}

const ProjectManagerFormSummary: React.FC<Props> = (props) => {
  const { projectManagerFormChangesByLabel } = useFragment(
    graphql`
      fragment ProjectManagerFormSummary_projectRevision on ProjectRevision {
        projectManagerFormChangesByLabel(first: 500) {
          edges {
            node {
              formChange {
                newFormData
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

  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerFormSummary_query on Query {
        allCifUsers {
          edges {
            node {
              rowId
              id
              fullName
            }
          }
        }
      }
    `,
    props.query
  );

  const areManagersEmpty = useMemo(() => {
    return !projectManagerFormChangesByLabel.edges.some(
      ({ node }) => node?.formChange?.newFormData.cifUserId
    );
  }, [projectManagerFormChangesByLabel.edges]);

  const managersJSX = useMemo(() => {
    return projectManagerFormChangesByLabel.edges.map(({ node }) => {
      if (!node?.formChange) return;
      const nodeManager = allCifUsers.edges.find(
        (manager) =>
          manager.node.rowId === node.formChange?.newFormData.cifUserId
      );

      return (
        <FormBase
          key={node.formChange.newFormData.projectManagerLabelId}
          tagName={"dl"}
          theme={readOnlyTheme}
          schema={projectManagerSchema as JSONSchema7}
          uiSchema={createProjectManagerUiSchema(
            nodeManager ? nodeManager.node.fullName : "",
            node.projectManagerLabel.label
          )}
          formData={node.formChange.newFormData}
          formContext={{
            query: props.query,
            form: node.formChange.newFormData,
          }}
        />
      );
    });
  }, [allCifUsers.edges, props.query, projectManagerFormChangesByLabel]);

  return (
    <>
      <h3>Project Managers</h3>
      {areManagersEmpty ? (
        <p>
          <em>Project managers not added</em>
        </p>
      ) : (
        managersJSX
      )}
    </>
  );
};

export default ProjectManagerFormSummary;
