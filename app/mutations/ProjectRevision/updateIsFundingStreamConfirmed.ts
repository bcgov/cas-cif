import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateProjectRevisionMutation } from "updateProjectRevisionMutation.graphql";

const mutation = graphql`
  mutation updateIsFundingStreamConfirmedMutation(
    $input: UpdateProjectRevisionInput!
  ) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        isFundingStreamConfirmed
      }
    }
  }
`;

const useUpdateIsFundingStreamConfirmed = () => {
  return useDebouncedMutation<updateProjectRevisionMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdateIsFundingStreamConfirmed };
