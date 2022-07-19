import { graphql } from "react-relay";
import { updateProjectEmissionIntensityFormChangeMutation } from "__generated__/updateProjectEmissionIntensityFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateProjectEmissionIntensityFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        changeStatus
        newFormData
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useUpdateProjectEmissionIntensityFormChange = () => {
  return useDebouncedMutation<updateProjectEmissionIntensityFormChangeMutation>(
    mutation,
    () =>
      "An error occurred when updating the project emissions intensity report."
  );
};

export { mutation, useUpdateProjectEmissionIntensityFormChange };
