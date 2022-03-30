import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";

export const mutation = graphql`
  mutation deleteProjectRevisionMutation($input: DeleteProjectRevisionInput!) {
    deleteProjectRevision(input: $input) {
      __typename
    }
  }
`;

export const useDeleteProjectRevisionMutation = () => {
  return useMutationWithErrorMessage(
    mutation,
    () => "An error occurred when deleting a revision."
  );
};
