import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { addMilestoneToRevisionMutation } from "__generated__/addMilestoneToRevisionMutation.graphql";

const mutation = graphql`
  mutation addMilestoneToRevisionMutation(
    $input: AddMilestoneToRevisionInput!
  ) {
    addMilestoneToRevision(input: $input) {
      formChanges {
        id
        newFormData
        projectRevisionByProjectRevisionId {
          ...ProjectMilestoneReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useAddMilestoneToRevision = () => {
  return useMutationWithErrorMessage<addMilestoneToRevisionMutation>(
    mutation,
    () => "An error occurred while adding the Milestone to the revision."
  );
};

export { mutation, useAddMilestoneToRevision };
