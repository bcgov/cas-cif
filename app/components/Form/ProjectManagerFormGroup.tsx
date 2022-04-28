import { useRef } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectManagerFormGroup_query$key } from "__generated__/ProjectManagerFormGroup_query.graphql";
import { ProjectManagerFormGroup_revision$key } from "__generated__/ProjectManagerFormGroup_revision.graphql";
import validateFormWithErrors from "lib/helpers/validateFormWithErrors";
import FormBorder from "lib/theme/components/FormBorder";
import ProjectManagerForm from "./ProjectManagerForm";
import { Button } from "@button-inc/bcgov-theme";
import { useUpdateProjectManagerFormChange } from "mutations/ProjectManager/updateProjectManagerFormChange";
import SavingIndicator from "./SavingIndicator";
import useDeleteManagerFromRevisionMutation from "mutations/ProjectManager/deleteManagerFromRevision";
import useAddManagerToRevisionMutation from "mutations/ProjectManager/addManagerToRevision";

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
                newFormData
                formChangeByPreviousFormChangeId {
                  changeStatus
                  newFormData
                }
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

  const { edges } = projectRevision.managerFormChanges;

  const [deleteManager, isDeleting] = useDeleteManagerFromRevisionMutation();
  const handleDelete = (formChangeId: string, operation) => {
    deleteManager({
      context: {
        operation: operation,
        id: formChangeId,
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
      onError: (error) => {
        console.log(error);
      },
    });
  };

  const [updateFormChange, isUpdating] = useUpdateProjectManagerFormChange();
  const handleUpdate = (formChangeId: string, newFormData: any) => {
    updateFormChange({
      variables: {
        input: {
          id: formChangeId,
          formChangePatch: {
            changeStatus: "pending",
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
            operation: undefined,
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
          updateFormChange({
            variables: {
              input: {
                id: node.formChange.id,
                formChangePatch: {
                  changeStatus: "staged",
                },
              },
            },
            debounceKey: node.formChange.id,
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

  const handleUndo = async () => {
    let undoneFormData;
    const completedPromises: Promise<void>[] = [];

    edges.forEach(({ node }) => {
      undoneFormData =
        node.formChange?.formChangeByPreviousFormChangeId?.changeStatus ===
        "committed"
          ? node.formChange.formChangeByPreviousFormChangeId.newFormData
          : {};

      const promise = new Promise<void>((resolve, reject) => {
        updateFormChange({
          variables: {
            input: {
              id: node.formChange.id,
              formChangePatch: {
                changeStatus: "pending",
                newFormData: undoneFormData,
              },
            },
          },
          optimisticResponse: {
            updateFormChange: {
              formChange: {
                id: node.formChange.id,
                changeStatus: "pending",
                newFormData: undoneFormData,
                operation: undefined,
                projectRevisionByProjectRevisionId: undefined,
              },
            },
          },
          debounceKey: node.formChange.id,
          onCompleted: () => resolve(),
          onError: reject,
        });
      });
      completedPromises.push(promise);
    });

    try {
      await Promise.all(completedPromises);
    } catch (e) {
      // the failing mutation will display an error message and send the error to sentry
    }
  };

  return (
    <div>
      <header>
        <h2>Project Managers</h2>
        <Button
          type="button"
          style={{
            marginRight: "1rem",
            marginBottom: "1rem",
            marginLeft: "0rem",
          }}
          variant="secondary"
          onClick={handleUndo}
        >
          Undo Changes
        </Button>
        <SavingIndicator isSaved={!isUpdating && !isAdding && !isDeleting} />
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
