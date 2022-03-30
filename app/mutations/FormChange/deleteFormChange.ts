import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
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

export const useDeleteFormChange = () => {
  return useMutationWithErrorMessage<deleteFormChangeMutation>(
    mutation,
    () => "An error occurred when deleting."
  );
};

export const useDeleteFormChangeWithConnection = () => {
  return useMutationWithErrorMessage<deleteFormChangeWithConnectionMutation>(
    mutationWithConnection,
    () => "An error occurred when deleting."
  );
};
