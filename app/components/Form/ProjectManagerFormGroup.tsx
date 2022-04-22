import { useMemo, useRef } from "react";
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
              ...projectRevision,
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

  const lastEditedDate = useMemo(() => {
    const mostRecentUpdate = edges
      .filter((e) => e.node.formChange)
      .map((e) => e.node.formChange.updatedAt)
      .sort((a, b) => Date.parse(b) - Date.parse(a))[0];
    return new Date(mostRecentUpdate);
  }, [edges]);

  return (
    <div>
      <header>
        <h2>Project Managers</h2>
        <SavingIndicator
          isSaved={!isUpdating && !isAdding && !isDeleting}
          lastEdited={lastEditedDate}
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
