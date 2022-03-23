import { useMemo, useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormGroup_query$key } from "__generated__/ProjectManagerFormGroup_query.graphql";
import { ProjectManagerFormGroup_revision$key } from "__generated__/ProjectManagerFormGroup_revision.graphql";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import FormBorder from "lib/theme/components/FormBorder";
import ProjectManagerForm from "./ProjectManagerForm";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdateFormChange } from "mutations/FormChange/updateFormChange";
import SavingIndicator from "./SavingIndicator";

interface Props {
  query: ProjectManagerFormGroup_query$key;
  revision: ProjectManagerFormGroup_revision$key;
  onSubmit: () => void;
}

const ProjectManagerFormGroup: React.FC<Props> = (props) => {
  const formRefs = useRef({});
  const query = useFragment(
    graphql`
      fragment ProjectManagerFormGroup_query on Query {
        ...ProjectManagerForm_query
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
              formChange {
                id
                changeStatus
                updatedAt
              }
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

  const [updateFormChange, isUpdating] = useUpdateFormChange();

  const stageProjectManagersFormChanges = async () => {
    const errors = Object.keys(formRefs.current).reduce((agg, formId) => {
      const formObject = formRefs.current[formId];
      return [...agg, ...validateFormWithErrors(formObject)];
    }, []);

    if (errors.length > 0) return;

    const completedPromises: Promise<void>[] = [];

    projectRevision.managerFormChanges.edges.forEach(({ node }) => {
      if (node.formChange?.changeStatus === "pending") {
        const promise = new Promise<void>((resolve) => {
          updateFormChange({
            variables: {
              input: {
                id: node.formChange.id,
                formChangePatch: {
                  changeStatus: "staged",
                },
              },
            },
            optimisticResponse: {
              updateFormChange: {
                formChange: {
                  changeStatus: "staged",
                },
              },
            },
            debounceKey: node.formChange.id,
            onCompleted: () => {
              resolve();
            },
          });
        });
        completedPromises.push(promise);
      }
    });

    await Promise.all(completedPromises);

    props.onSubmit();
  };

  const lastEditedDate = useMemo(() => {
    const mostRecentUpdate = projectRevision.managerFormChanges.edges
      .filter((e) => e.node.formChange)
      .map((e) => e.node.formChange.updatedAt)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
    return new Date(mostRecentUpdate);
  }, [projectRevision.managerFormChanges.edges]);

  return (
    <div>
      <header>
        <h2>Project Managers</h2>
        <SavingIndicator isSaved={!isUpdating} lastEdited={lastEditedDate} />
      </header>
      <FormBorder>
        {projectRevision.managerFormChanges.edges.map(({ node }) => (
          <ProjectManagerForm
            key={node.projectManagerLabel.id}
            managerFormChange={node}
            query={query}
            projectId={projectRevision.projectFormChange.formDataRecordId}
            projectRevisionId={projectRevision.id}
            projectRevisionRowId={projectRevision.rowId}
            updateFormChange={updateFormChange}
            formRefs={formRefs}
          />
        ))}
      </FormBorder>
      <Button
        size="medium"
        variant="primary"
        onClick={stageProjectManagersFormChanges}
        disabled={isUpdating}
      >
        Submit Managers
      </Button>
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
        div :global(.right-aligned-column) {
          display: flex;
          justify-content: flex-end;
          align-items: flex-start;
        }
      `}</style>
    </div>
  );
};

export default ProjectManagerFormGroup;
