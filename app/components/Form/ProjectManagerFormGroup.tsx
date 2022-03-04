import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormGroup_query$key } from "__generated__/ProjectManagerFormGroup_query.graphql";
import { ProjectManagerFormGroup_revision$key } from "__generated__/ProjectManagerFormGroup_revision.graphql";
import { ValidatingFormProps } from "./Interfaces/FormValidationTypes";
import Grid from "@button-inc/bcgov-theme/Grid";
import FormBorder from "lib/theme/components/FormBorder";
import ProjectManagerForm from "./ProjectManagerForm";

interface Props extends ValidatingFormProps {
  query: ProjectManagerFormGroup_query$key;
  revision: ProjectManagerFormGroup_revision$key;
  projectManagerFormRef: any;
}

const ProjectManagerFormGroup: React.FC<Props> = (props) => {
  const { allCifUsers } = useFragment(
    graphql`
      fragment ProjectManagerFormGroup_query on Query {
        allCifUsers {
          edges {
            node {
              rowId
              firstName
              lastName
            }
          }
        }
      }
    `,
    props.query
  );

  const projectRevision = useFragment(
    graphql`
      fragment ProjectManagerFormGroup_revision on ProjectRevision {
        id
        rowId
        managerFormChanges: projectManagerFormChangesByLabel {
          edges {
            node {
              projectManagerLabel {
                id
              }
              ...ProjectManagerForm_managerFormChange
            }
          }
        }
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.revision
  );

  return (
    <>
      <Grid cols={10} align="center">
        <Grid.Row>
          <Grid.Col span={10}>
            <FormBorder title="Project Managers">
              {projectRevision.managerFormChanges.edges.map(({ node }) => (
                <ProjectManagerForm
                  key={node.projectManagerLabel.id}
                  managerFormChange={node}
                  allCifUsers={allCifUsers}
                  projectId={projectRevision.projectFormChange.formDataRecordId}
                  projectRevisionId={projectRevision.id}
                  projectRevisionRowId={projectRevision.rowId}
                  setValidatingForm={(validator) =>
                    (props.projectManagerFormRef.current = validator)
                  }
                />
              ))}
            </FormBorder>
          </Grid.Col>
        </Grid.Row>
      </Grid>
      <style jsx>{`
        :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </>
  );
};

export default ProjectManagerFormGroup;
