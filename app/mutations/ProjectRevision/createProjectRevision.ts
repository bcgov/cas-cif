import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectRevisionMutation } from "__generated__/createProjectRevisionMutation.graphql";

export const mutation = graphql`
  mutation createProjectRevisionMutation($projectId: Int!) {
    createProjectRevision(input: { projectId: $projectId }) {
      projectRevision {
        id
      }
    }
  }
`;

export const useCreateProjectRevision = () =>
  useMutationWithErrorMessage<createProjectRevisionMutation>(
    mutation,
    () => "An error occurred while attempting to edit the project."
  );
