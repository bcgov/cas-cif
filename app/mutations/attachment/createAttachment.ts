import { graphql } from "react-relay";
import type { Environment } from "react-relay";
import type {
  createAttachmentMutationVariables,
  createAttachmentMutation as createAttachmentMutationType,
} from "createAttachmentMutation.graphql";
import BaseMutation from "mutations/BaseMutation";

export const mutation = graphql`
  mutation createAttachmentMutation($input: CreateAttachmentInput!) {
    createAttachment(input: $input) {
      attachment {
        file
        fileName
        fileSize
        fileType
        cifUserId
        projectId
      }
    }
  }
`;

const createAttachmentMutation = async (
  environment: Environment,
  variables: createAttachmentMutationVariables
) => {
  return new BaseMutation<createAttachmentMutationType>(
    "create-attachment-mutation"
  ).performMutation(environment, mutation, variables);
};

export default createAttachmentMutation;
