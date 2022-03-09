import { useMutation, graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { deleteManagerFromRevisionMutation } from "__generated__/deleteManagerFromRevisionMutation.graphql";

export const mutation = graphql`
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

export const useDeleteManagerFromRevisionMutation = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<deleteManagerFromRevisionMutation>
  ) => Disposable
) => {
  return useMutation<deleteManagerFromRevisionMutation>(
    mutation,
    commitMutationFn
  );
};

export default useDeleteManagerFromRevisionMutation;
