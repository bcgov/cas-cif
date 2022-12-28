import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateProjectRevisionMutation } from "updateProjectRevisionMutation.graphql";

const mutation = graphql`
  mutation updatePendingActionsFromMutation(
    $input: UpdateProjectRevisionInput!
  ) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        pendingActionsFrom
      }
    }
  }
`;

const useUpdatePendingActionsFrom = () => {
  return useDebouncedMutation<updateProjectRevisionMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdatePendingActionsFrom };
