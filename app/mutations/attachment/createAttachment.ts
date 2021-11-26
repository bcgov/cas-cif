import { graphql } from "react-relay";

export const createAttachmentMutation = graphql`
  mutation createAttachmentMutation($input: CreateAttachmentInput!) {
    createAttachment(input: $input) {
      attachment {
        id
        file
        fileName
      }
    }
  }
`;
