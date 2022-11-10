import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";

export const mutation = graphql`
  mutation deleteProjectRevisionMutation(
    $input: DeleteProjectRevisionAndAmendmentsInput!
  ) {
    deleteProjectRevisionAndAmendments(input: $input) {
      __typename
    }
  }
`;

export const useDeleteProjectRevisionMutation = () => {
  return useMutationWithErrorMessage(
    mutation,
    () => "An error occurred while attempting to delete the project revision."
  );
};
