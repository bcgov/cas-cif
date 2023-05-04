import { archiveProjectAttachmentFormChangeMutation } from "__generated__/archiveProjectAttachmentFormChangeMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";

const mutation = graphql`
  mutation archiveProjectAttachmentFormChangeMutation(
    $input: UpdateFormChangeInput!
    $connections: [ID!]!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id @deleteEdge(connections: $connections)
      }
    }
  }
`;

const useDeleteProjectAttachmentFormChange = () =>
  useMutationWithErrorMessage<archiveProjectAttachmentFormChangeMutation>(
    mutation,
    () => "An error occurred when deleting project attachment."
  );

export default useDeleteProjectAttachmentFormChange;
