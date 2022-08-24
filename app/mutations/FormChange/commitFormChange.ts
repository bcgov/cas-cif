import { commitFormChangeMutation } from "commitFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation commitFormChangeMutation($input: CommitFormChangeInput!) {
    commitFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        operation
        changeStatus
      }
    }
  }
`;

const useCommitFormChange = () => {
  return useMutationWithErrorMessage<commitFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useCommitFormChange };
