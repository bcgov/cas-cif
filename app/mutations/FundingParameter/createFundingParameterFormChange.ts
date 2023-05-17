import { graphql, Disposable, Environment } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { MutationConfig } from "relay-runtime";
import { createFundingParameterFormChangeMutation } from "__generated__/createFundingParameterFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createFundingParameterFormChangeMutation(
    $connections: [ID!]!
    $input: CreateFormChangeInput!
  ) {
    createFormChange(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          rowId
          newFormData
          operation
          changeStatus
          projectRevisionByProjectRevisionId {
            ...TaskList_projectRevision
          }
        }
      }
    }
  }
`;

export const useCreateFundingParameterFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createFundingParameterFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createFundingParameterFormChangeMutation>(
    mutation,
    () => "An error occurred while attempting to create the funding agreement.",
    commitMutationFn
  );
};
