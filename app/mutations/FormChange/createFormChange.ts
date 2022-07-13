import { createFormChangeMutation } from "createFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation createFormChangeMutation($input: CreateFormChangeInput!) {
    createFormChange(input: $input) {
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

const useCreateFormChange = () => {
  return useMutationWithErrorMessage<createFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useCreateFormChange };
