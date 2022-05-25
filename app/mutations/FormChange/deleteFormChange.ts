import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { Disposable, graphql, UseMutationConfig } from "react-relay";
import { deleteFormChangeMutation } from "__generated__/deleteFormChangeMutation.graphql";
import { deleteFormChangeWithConnectionMutation } from "__generated__/deleteFormChangeWithConnectionMutation.graphql";

export const mutationWithConnection = graphql`
  mutation deleteFormChangeWithConnectionMutation(
    $connections: [ID!]!
    $input: DeleteFormChangeInput!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId @deleteEdge(connections: $connections)
    }
  }
`;

export const mutation = graphql`
  mutation deleteFormChangeMutation($input: DeleteFormChangeInput!) {
    deleteFormChange(input: $input) {
      deletedFormChangeId
    }
  }
`;

export const useDeleteFormChange: () => [
  (config: UseMutationConfig<deleteFormChangeMutation>) => Disposable,
  boolean
] = () => {
  return useMutationWithErrorMessage<deleteFormChangeMutation>(
    mutation,
    () => "An error occurred when deleting."
  );
};

export const useDeleteFormChangeWithConnection: () => [
  (
    config: UseMutationConfig<deleteFormChangeWithConnectionMutation>
  ) => Disposable,
  boolean
] = () => {
  return useMutationWithErrorMessage<deleteFormChangeWithConnectionMutation>(
    mutationWithConnection,
    () => "An error occurred when deleting."
  );
};
