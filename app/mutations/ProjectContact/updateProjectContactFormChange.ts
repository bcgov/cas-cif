import { updateProjectContactFormChangeMutation } from "updateProjectContactFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateProjectContactFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectContactForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useUpdateProjectContactFormChange = () => {
  return useDebouncedMutation<updateProjectContactFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project contact form."
  );
};

export { mutation, useUpdateProjectContactFormChange };
