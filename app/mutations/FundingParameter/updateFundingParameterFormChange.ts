import { graphql } from "react-relay";
import { updateFundingParameterFormChangeMutation } from "__generated__/updateFundingParameterFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

/**
 *
 * Specific mutation for a form_change for a project.
 * Includes whether the suggested proposal reference is unique in the system.
 *
 */

const mutation = graphql`
  mutation updateFundingParameterFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        changeStatus
        newFormData
        projectRevisionByProjectRevisionId {
          ...ProjectFundingAgreementForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useUpdateFundingParameterFormChange = () => {
  return useDebouncedMutation<updateFundingParameterFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project overview."
  );
};

export { mutation, useUpdateFundingParameterFormChange };
