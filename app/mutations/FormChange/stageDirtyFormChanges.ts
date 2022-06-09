import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { stageDirtyFormChangesMutation } from "__generated__/stageDirtyFormChangesMutation.graphql";

const mutation = graphql`
  mutation stageDirtyFormChangesMutation($input: StageDirtyFormChangesInput!) {
    stageDirtyFormChanges(input: $input) {
      formChanges {
        id
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

export const useStageDirtyFormChanges = () => {
  return useMutationWithErrorMessage<stageDirtyFormChangesMutation>(
    mutation,
    () => "An error occurred while attempting to stage the forms."
  );
};
