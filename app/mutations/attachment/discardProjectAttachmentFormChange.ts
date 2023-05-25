import { discardProjectAttachmentFormChangeMutation } from "__generated__/discardProjectAttachmentFormChangeMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";

const mutation = graphql`
  mutation discardProjectAttachmentFormChangeMutation(
    $input: DiscardProjectAttachmentFormChangeInput!
    $connections: [ID!]!
  ) {
    discardProjectAttachmentFormChange(input: $input) {
      formChanges {
        id @deleteEdge(connections: $connections)
      }
    }
  }
`;

const useDiscardProjectAttachmentFormChange = () =>
  useMutationWithErrorMessage<discardProjectAttachmentFormChangeMutation>(
    mutation,
    () => "An error occurred when discarding project attachment."
  );

export default useDiscardProjectAttachmentFormChange;
