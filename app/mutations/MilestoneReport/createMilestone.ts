import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { createMilestoneMutation } from "__generated__/createMilestoneMutation.graphql";

const mutation = graphql`
  mutation createMilestoneMutation($input: CreateFormChangeInput!) {
    createFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectMilestoneReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useCreateMilestone = () => {
  return useMutationWithErrorMessage<createMilestoneMutation>(
    mutation,
    () => "An error occurred while adding the Milestone to the revision."
  );
};

export { mutation, useCreateMilestone };
