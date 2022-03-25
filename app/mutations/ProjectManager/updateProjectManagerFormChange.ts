import { updateProjectManagerFormChangeMutation } from "updateProjectManagerFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateProjectManagerFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectManagerFormGroup_revision
        }
      }
    }
  }
`;

const useUpdateProjectManagerFormChange = () => {
  return useDebouncedMutation<updateProjectManagerFormChangeMutation>(mutation);
};

export { mutation, useUpdateProjectManagerFormChange };
