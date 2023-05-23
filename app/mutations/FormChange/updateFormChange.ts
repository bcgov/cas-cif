import { updateFormChangeMutation } from "updateFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useUpdateFormChange = () => {
  return useDebouncedMutation<updateFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the form."
  );
};

export { mutation, useUpdateFormChange };
