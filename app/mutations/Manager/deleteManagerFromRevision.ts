import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql, Disposable, Environment } from "react-relay";
import { MutationConfig, PayloadError } from "relay-runtime";
import {
  deleteManagerFromRevisionMutation,
  deleteManagerFromRevisionMutation$variables,
  deleteManagerFromRevisionMutation$data,
} from "__generated__/deleteManagerFromRevisionMutation.graphql";
import {
  deleteManagerFromRevisionWithArchiveMutation,
  deleteManagerFromRevisionWithArchiveMutation$variables,
  deleteManagerFromRevisionWithArchiveMutation$data,
} from "__generated__/deleteManagerFromRevisionWithArchiveMutation.graphql";

interface DeleteManagerOptions {
  context: { operation: string; id: string; projectRevision: string };
  onCompleted?: (
    response:
      | deleteManagerFromRevisionMutation$data
      | deleteManagerFromRevisionWithArchiveMutation$data,
    errors: PayloadError[]
  ) => void;
  onError?: (error: Error) => void;
}

// Delete mutation for a form_change that was created in the same revision.
export const deleteMutation = graphql`
  mutation deleteManagerFromRevisionMutation(
    $input: DeleteFormChangeInput!
    $projectRevision: ID!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId
      query {
        projectRevision(id: $projectRevision) {
          managerFormChanges: projectManagerFormChangesByLabel {
            edges {
              node {
                projectManagerLabel {
                  id
                  rowId
                  label
                }
                formChange {
                  id
                  newFormData
                }
              }
            }
          }
        }
      }
    }
  }
`;

// Delete mutation for a form_change that was created in a previous revision & should be updated with operation = 'ARCHIVE'.
export const archiveMutation = graphql`
  mutation deleteManagerFromRevisionWithArchiveMutation(
    $input: UpdateFormChangeInput!
    $projectRevision: ID!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
      }
      query {
        projectRevision(id: $projectRevision) {
          managerFormChanges: projectManagerFormChangesByLabel {
            edges {
              node {
                projectManagerLabel {
                  id
                  rowId
                  label
                }
                formChange {
                  id
                  newFormData
                }
              }
            }
          }
        }
      }
    }
  }
`;

const useDeleteMutation = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<
      | deleteManagerFromRevisionMutation
      | deleteManagerFromRevisionWithArchiveMutation
    >
  ) => Disposable
) => {
  return useMutationWithErrorMessage<
    | deleteManagerFromRevisionMutation
    | deleteManagerFromRevisionWithArchiveMutation
  >(
    deleteMutation,
    () => "An error occurred when removing a manager.",
    commitMutationFn
  );
};

const useArchiveMutation = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<
      | deleteManagerFromRevisionMutation
      | deleteManagerFromRevisionWithArchiveMutation
    >
  ) => Disposable
) => {
  return useMutationWithErrorMessage<
    | deleteManagerFromRevisionMutation
    | deleteManagerFromRevisionWithArchiveMutation
  >(
    archiveMutation,
    () => "An error occurred when deleting a manager.",
    commitMutationFn
  );
};

export const useDeleteManagerFromRevisionMutation = (): [
  (options: DeleteManagerOptions) => void,
  boolean
] => {
  const [deleteManager, isDeleting] = useDeleteMutation();
  const [archiveManager, isArchiving] = useArchiveMutation();
  const deleteOrArchiveManager = (options: DeleteManagerOptions) => {
    const { context, onCompleted, onError } = options;
    if (context.operation === "CREATE") {
      const variables: deleteManagerFromRevisionMutation$variables = {
        input: {
          id: context.id,
        },
        projectRevision: context.projectRevision,
      };

      deleteManager({ variables, onCompleted, onError });
    } else {
      const variables: deleteManagerFromRevisionWithArchiveMutation$variables =
        {
          input: {
            id: context.id,
            formChangePatch: {
              operation: "ARCHIVE",
            },
          },
          projectRevision: context.projectRevision,
        };
      archiveManager({
        variables,
        optimisticResponse: {
          updateFormChange: {
            formChange: {
              id: context.id,
              operation: "ARCHIVE",
              newFormData: {},
            },
          },
        },
        onCompleted,
        onError,
      });
    }
  };
  const inFlight = isDeleting || isArchiving;
  return [deleteOrArchiveManager, inFlight];
};

export default useDeleteManagerFromRevisionMutation;
