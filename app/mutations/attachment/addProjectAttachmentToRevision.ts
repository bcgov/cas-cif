import { graphql } from "react-relay";
import type { addProjectAttachmentToRevisionMutation } from "addProjectAttachmentToRevisionMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation addProjectAttachmentToRevisionMutation(
    $connections: [ID!]!
    $input: AddProjectAttachmentToRevisionInput!
  ) {
    addProjectAttachmentToRevision(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          rowId
          asProjectAttachment {
            attachmentByAttachmentId {
              ...AttachmentTableRow_attachment
            }
          }
        }
      }
    }
  }
`;

const useAddProjectAttachmentToRevision = () =>
  useMutationWithErrorMessage<addProjectAttachmentToRevisionMutation>(
    mutation,
    () => "An error occurred while attempting to create an attachment."
  );

export { mutation, useAddProjectAttachmentToRevision };
