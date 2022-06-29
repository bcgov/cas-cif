import { graphql, Disposable, Environment } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { MutationConfig } from "relay-runtime";
import { createParameterFundingFormChangeMutation } from "__generated__/createParameterFundingFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createParameterFundingFormChangeMutation(
    $input: CreateFormChangeInput!
  ) {
    createFormChange(input: $input) {
      formChange {
        id
        projectRevisionId
      }
    }
  }
`;

export const useCreateFundingParameterFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createParameterFundingFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createParameterFundingFormChangeMutation>(
    mutation,
    () => "An error occurred while attempting to create the contact.",
    commitMutationFn
  );
};
