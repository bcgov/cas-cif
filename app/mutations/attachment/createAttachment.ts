import { graphql } from "react-relay";
import type { createAttachmentMutation } from "createAttachmentMutation.graphql";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation createAttachmentMutation($input: CreateAttachmentInput!) {
    createAttachment(input: $input) {
      attachment {
        rowId
        file
        fileName
        fileSize
        fileType
        createdBy
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
