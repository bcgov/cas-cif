import { graphql } from "react-relay";
import { updateParameterFundingFormChangeMutation } from "__generated__/updateParameterFundingFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

/**
 *
 * Specific mutation for a form_change for a project.
 * Includes whether the suggested proposal reference is unique in the system.
 *
 */

export const mutation = graphql`
  mutation updateParameterFundingFormChangeMutation(
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

export const useUpdateFundingParameterFormChange = () => {
  return useDebouncedMutation<updateParameterFundingFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project overview."
  );
};
