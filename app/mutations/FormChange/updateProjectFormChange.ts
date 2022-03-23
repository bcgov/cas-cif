import { graphql } from "react-relay";
import { updateProjectFormChangeMutation } from "__generated__/updateProjectFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

/**
 *
 * Specific mutation for a form_change for a project.
 * Includes whether the suggested proposal reference is unique in the system.
 *
 */

export const mutation = graphql`
  mutation updateProjectFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        isUniqueValue(columnName: "proposalReference")
      }
    }
  }
`;

export const useUpdateProjectFormChange = () => {
  return useDebouncedMutation<updateProjectFormChangeMutation>(mutation);
};
