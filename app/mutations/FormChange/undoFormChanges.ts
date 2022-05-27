import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { undoFormChangesMutation } from "undoFormChangesMutation.graphql";
import { graphql } from "react-relay";

const mutation = graphql`
  mutation undoFormChangesMutation($input: UndoFormChangesInput!) {
    undoFormChanges(input: $input) {
      projectRevision {
        ...ProjectForm_projectRevision
        ...ProjectManagerFormGroup_projectRevision
        ...ProjectContactForm_projectRevision
        ...ProjectQuarterlyReportForm_projectRevision
      }
    }
  }
`;

const useUndoFormChanges = () => {
  return useMutationWithErrorMessage<undoFormChangesMutation>(
    mutation,
    () => "An error occurred when undoing the form changes."
  );
};

export { mutation, useUndoFormChanges };
