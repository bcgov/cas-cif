import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateAdditionalFundingSourceFormChangeMutation } from "__generated__/updateAdditionalFundingSourceFormChangeMutation.graphql";

const mutation = graphql`
  mutation updateAdditionalFundingSourceFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        changeStatus
        newFormData
        operation
      }
    }
  }
`;

const useUpdateAdditionalFundingSourceFormChange = () => {
  return useDebouncedMutation<updateAdditionalFundingSourceFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the additional funding source form."
  );
};

export { mutation, useUpdateAdditionalFundingSourceFormChange };
