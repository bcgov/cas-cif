import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectRevisionWithRevisionTypeMutation } from "__generated__/createProjectRevisionWithRevisionTypeMutation.graphql";

export const mutation = graphql`
  mutation createProjectRevisionWithRevisionTypeMutation(
    $projectId: Int!
    $revisionType: String!
  ) {
    createProjectRevisionWithRevisionType(
      input: { projectId: $projectId, revisionType: $revisionType }
    ) {
      projectRevision {
        id
      }
    }
  }
`;

export const useCreateProjectRevisionWithRevisionType = () =>
  useMutationWithErrorMessage<createProjectRevisionWithRevisionTypeMutation>(
    mutation,
    () => "An error occurred while attempting to create the project revision."
  );
