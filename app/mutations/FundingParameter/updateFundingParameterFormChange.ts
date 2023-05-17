import { graphql } from "react-relay";
import { updateFundingParameterFormChangeMutation } from "__generated__/updateFundingParameterFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

/**
 *
 * Specific mutation for a form_change for a funding agreement.
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
        totalProjectValue
        proponentsSharePercentage
        newFormData
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
        }
        calculatedTotalPaymentAmountToDate
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
