import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation useCommitProjectRevisionMutation(
    $input: CommitProjectRevisionInput!
  ) {
    commitProjectRevision(input: $input) {
      projectRevision {
        id
        changeStatus
        changeReason
        projectFormChange {
          id
          newFormData
        }
        revisionStatus
      }
    }
  }
`;

export const useCommitProjectRevision = () =>
  useMutationWithErrorMessage(
    mutation,
    () => "An error occurred while attempting to commit the project revision."
  );
