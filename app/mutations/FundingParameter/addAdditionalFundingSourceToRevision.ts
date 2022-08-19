import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { addAdditionalFundingSourceToRevisionMutation } from "__generated__/addAdditionalFundingSourceToRevisionMutation.graphql";

const mutation = graphql`
  mutation addAdditionalFundingSourceToRevisionMutation(
    $connections: [ID!]!
    $input: AddAdditionalFundingSourceToRevisionInput!
  ) {
    addAdditionalFundingSourceToRevision(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          newFormData
          projectRevisionByProjectRevisionId {
            ...ProjectFundingAgreementForm_projectRevision
          }
        }
      }
    }
  }
`;

const useAddAdditionalFundingSourceToRevision = () => {
  return useMutationWithErrorMessage<addAdditionalFundingSourceToRevisionMutation>(
    mutation,
    () =>
      "An error occurred while adding the additional funding source to the revision."
  );
};

export { mutation, useAddAdditionalFundingSourceToRevision };
