import { graphql } from "react-relay";
import type { createAttachmentMutation } from "createAttachmentMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation createAttachmentMutation(
    $connections: [ID!]!
    $input: CreateAttachmentInput!
  ) {
    createAttachment(input: $input) {
      attachmentEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          file
          fileName
        }
      }
    }
  }
`;

const useCreateAttachment = () =>
  useMutationWithErrorMessage<createAttachmentMutation>(
    mutation,
    () => "An error occurred while attempting to create an attachment."
  );

export { mutation, useCreateAttachment };
