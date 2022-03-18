import { useMutation, graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { deleteManagerFromRevisionMutation } from "__generated__/deleteManagerFromRevisionMutation.graphql";
import { deleteManagerFromRevisionWithArchiveMutation } from "__generated__/deleteManagerFromRevisionWithArchiveMutation.graphql";

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

export const useDeleteManagerFromRevisionMutation = (
  operation: any,
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<
      | deleteManagerFromRevisionMutation
      | deleteManagerFromRevisionWithArchiveMutation
    >
  ) => Disposable
) => {
  // Dynamically set the mutation to use based on the operation.
  const mutation = operation === "CREATE" ? deleteMutation : archiveMutation;
  return useMutation<
    | deleteManagerFromRevisionMutation
    | deleteManagerFromRevisionWithArchiveMutation
  >(mutation, commitMutationFn);
};

export default useDeleteManagerFromRevisionMutation;
