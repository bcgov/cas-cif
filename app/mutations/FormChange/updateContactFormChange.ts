import { updateFormChangeMutation } from "updateFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateContactFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        changeStatus
        isUniqueValue(columnName: "email")
      }
    }
  }
`;

const useUpdateContactFormChange = () => {
  return useDebouncedMutation<updateFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdateContactFormChange };
