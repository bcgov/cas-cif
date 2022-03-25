import { updateFormChangeMutation } from "updateFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        changeStatus
      }
    }
  }
`;

const useUpdateFormChange = () => {
  return useDebouncedMutation<updateFormChangeMutationType>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdateFormChange };
