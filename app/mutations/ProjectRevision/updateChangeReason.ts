import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateProjectRevisionMutation } from "updateProjectRevisionMutation.graphql"

const mutation = graphql`
  mutation updateChangeReasonMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        changeReason
        updatedAt
      }
    }
  }
`;

const useUpdateChangeReason = () => {
  return useDebouncedMutation<updateProjectRevisionMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdateChangeReason };
