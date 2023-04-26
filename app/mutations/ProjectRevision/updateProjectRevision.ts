import useDebouncedMutation from "mutations/useDebouncedMutation";
import { graphql } from "react-relay";
import { updateProjectRevisionMutation } from "__generated__/updateProjectRevisionMutation.graphql";

const mutation = graphql`
  mutation updateProjectRevisionMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        projectFormChange {
          id
          newFormData
        }
        revisionStatus
        changeReason
      }
    }
  }
`;

const useUpdateProjectRevision = () => {
  return useDebouncedMutation<updateProjectRevisionMutation>(
    mutation,
    () => "An error occurred when updating the project revision."
  );
};

export { mutation, useUpdateProjectRevision };
