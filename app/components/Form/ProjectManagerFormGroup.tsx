import { useRef, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormGroup_query$key } from "__generated__/ProjectManagerFormGroup_query.graphql";
import { ProjectManagerFormGroup_projectRevision$key } from "__generated__/ProjectManagerFormGroup_projectRevision.graphql";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import FormBorder from "lib/theme/components/FormBorder";
import ProjectManagerForm from "./ProjectManagerForm";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdateProjectManagerFormChange } from "mutations/ProjectManager/updateProjectManagerFormChange";
import SavingIndicator from "./SavingIndicator";
import useDeleteManagerFromRevisionMutation from "mutations/ProjectManager/deleteManagerFromRevision";
import useAddManagerToRevisionMutation from "mutations/ProjectManager/addManagerToRevision";
import UndoChangesButton from "./UndoChangesButton";
import { useStageFormChange } from "mutations/FormChange/stageFormChange";

interface Props {
  query: ProjectManagerFormGroup_query$key;
  projectRevision: ProjectManagerFormGroup_projectRevision$key;
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
      fragment ProjectManagerFormGroup_projectRevision on ProjectRevision {
        id
        rowId
        changeStatus
        managerFormChanges: projectManagerFormChangesByLabel(first: 1000)
          @connection(key: "ProjectManagerFormGroup_managerFormChanges") {
          edges {
            node {
              formChange {
                rowId
                id
                changeStatus
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
    props.projectRevision
  );

  const { edges } = projectRevision.managerFormChanges;

  const [deleteManager, isDeleting] = useDeleteManagerFromRevisionMutation();

  const [applyStageFormChangeMutation, isStaging] = useStageFormChange();

  const handleDelete = (
    formChangeId: string,
    formChangeRowId: number,
    operation
  ) => {
    deleteManager({
      context: {
        operation: operation,
        id: formChangeId,
        rowId: formChangeRowId,
        projectRevision: projectRevision.id,
      },
    });
  };

  const [addManager, isAdding] = useAddManagerToRevisionMutation();
  const handleAdd = (newFormData: any, labelId: string) => {
    addManager({
      variables: {
        projectRevision: projectRevision.id,
        projectRevisionId: projectRevision.rowId,
        newFormData,
      },
      optimisticResponse: {
        createFormChange: {
          query: {
            projectRevision: {
              projectFormChange: undefined,
              managerFormChanges: {
                edges: edges.map(
                  ({ node: { projectManagerLabel, formChange } }) => {
                    if (projectManagerLabel.id === labelId) {
                      return {
                        node: {
                          projectManagerLabel: projectManagerLabel,
                          formChange: {
                            id: "new",
                            newFormData,
                          },
                        },
                      };
                    }
                    return {
                      node: {
                        projectManagerLabel,
                        formChange,
                      },
                    };
                  }
                ),
              },
            },
          },
        },
      },
    });
  };

  const [updateFormChange, isUpdating] = useUpdateProjectManagerFormChange();
  const handleUpdate = (
    formChangeId: string,
    rowId: number,
    newFormData: any
  ) => {
    updateFormChange({
      variables: {
        input: {
          rowId,
          formChangePatch: {
            newFormData,
          },
        },
      },
      optimisticResponse: {
        updateFormChange: {
          formChange: {
            id: formChangeId,
            changeStatus: "pending",
            newFormData,
            projectRevisionByProjectRevisionId: undefined,
          },
        },
      },
      debounceKey: formChangeId,
    });
  };

  const stageProjectManagersFormChanges = async () => {
    const errors = Object.keys(formRefs.current).reduce((agg, formId) => {
      const formObject = formRefs.current[formId];
      return [...agg, ...validateFormWithErrors(formObject)];
    }, []);

    const completedPromises: Promise<void>[] = [];

    edges.forEach(({ node }) => {
      if (node.formChange?.changeStatus === "pending") {
        const promise = new Promise<void>((resolve, reject) => {
          applyStageFormChangeMutation({
            variables: {
              input: {
                rowId: node.formChange.rowId,
                formChangePatch: {},
              },
            },
            onCompleted: () => resolve(),
            onError: reject,
          });
        });
        completedPromises.push(promise);
      }
    });

    try {
      await Promise.all(completedPromises);

      if (errors.length === 0) props.onSubmit();
    } catch (e) {
      // the failing mutation will display an error message and send the error to sentry
    }
  };

  // Get all form changes ids to get used in the undo changes button
  const formChangeIds = useMemo(() => {
    return projectRevision.managerFormChanges.edges.map(
      ({ node }) => node.formChange?.rowId
    );
  }, [projectRevision.managerFormChanges]);

  return (
    <div>
      <header>
        <h2>Project Managers</h2>
        <UndoChangesButton formChangeIds={formChangeIds} />
        <SavingIndicator
          isSaved={!isUpdating && !isAdding && !isDeleting && !isStaging}
        />
      </header>
      <FormBorder>
        {edges.map(({ node }) => (
          <ProjectManagerForm
            key={node.projectManagerLabel.id}
            managerFormChange={node}
            query={query}
            projectRowId={projectRevision.projectFormChange.formDataRecordId}
            onDelete={handleDelete}
            onAdd={(newFormData) =>
              handleAdd(newFormData, node.projectManagerLabel.id)
            }
            onUpdate={handleUpdate}
            formRefs={formRefs}
            disabled={isUpdating || isAdding || isDeleting}
          />
        ))}
      </FormBorder>
      {projectRevision.changeStatus !== "committed" && (
        <Button
          size="medium"
          variant="primary"
          onClick={stageProjectManagersFormChanges}
          disabled={isUpdating}
        >
          Submit Project Managers
        </Button>
      )}
      <style jsx>{`
        div :global(button.pg-button) {
          margin-left: 0.4em;
          margin-right: 0em;
        }
      `}</style>
    </div>
  );
};

export default ProjectManagerFormGroup;
