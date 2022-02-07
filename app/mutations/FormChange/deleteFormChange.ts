import { graphql, useMutation } from "react-relay";
import { deleteFormChangeMutation } from "__generated__/deleteFormChangeMutation.graphql";

export const mutation = graphql`
  mutation deleteFormChangeMutation(
    $connections: [ID!]!
    $input: DeleteFormChangeInput!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId @deleteEdge(connections: $connections)
    }
  }
`;

export const useDeleteFormChange = () => {
  return useMutation<deleteFormChangeMutation>(mutation);
};
