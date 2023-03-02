import { graphql } from "react-relay";
import type { archiveAttachmentMutation } from "archiveAttachmentMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation archiveAttachmentMutation(
    $connections: [ID!]!
    $input: UpdateAttachmentInput!
  ) {
    updateAttachment(input: $input) {
      attachment {
        id @deleteEdge(connections: $connections)
      }
    }
  }
`;

const useArchiveAttachment = () =>
  useMutationWithErrorMessage<archiveAttachmentMutation>(
    mutation,
    () => "An error occurred while attempting to archive an attachment."
  );

export { mutation, useArchiveAttachment };
