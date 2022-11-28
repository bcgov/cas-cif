import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectRevisionMutation } from "__generated__/createProjectRevisionMutation.graphql";

export const mutation = graphql`
  mutation createProjectRevisionMutation(
    $projectId: Int!
    $revisionType: String
    $amendmentTypes: [String]
    $pendingActionsFrom: String
  ) {
    createProjectRevision(
      input: {
        projectId: $projectId
        revisionType: $revisionType
        amendmentTypes: $amendmentTypes
        pendingActionsFrom: $pendingActionsFrom
      }
    ) {
      projectRevision {
        id
        rowId
      }
    }
  }
`;

export const useCreateProjectRevision = () =>
  useMutationWithErrorMessage<createProjectRevisionMutation>(
    mutation,
    () => "An error occurred while attempting to create the project revision."
  );
