import { graphql } from "react-relay";
import type { Environment } from "react-relay";
import type {
  createAttachmentMutationVariables,
  createAttachmentMutation as createAttachmentMutationType,
} from "createAttachmentMutation.graphql";
import BaseMutation from "mutations/BaseMutation";

export const mutation = graphql`
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

const createAttachmentMutation = async (
  environment: Environment,
  variables: createAttachmentMutationVariables
) => {
  return new BaseMutation<createAttachmentMutationType>(
    "create-attachment-mutation"
  ).performMutation(environment, mutation, variables);
};

export default createAttachmentMutation;
