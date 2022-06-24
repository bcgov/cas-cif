import { createPrimaryContactMutation } from "createPrimaryContactMutation.graphql";
import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation createPrimaryContactMutation(
    $connections: [ID!]!
    $input: CreateFormChangeInput!
  ) {
    createFormChange(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          newFormData
          operation
          changeStatus
          asProjectContact {
            contactByContactId {
              ...ContactDetails_contact
            }
          }
        }
      }
    }
  }
`;

const useCreatePrimaryContact = () => {
  return useMutationWithErrorMessage<createPrimaryContactMutation>(
    mutation,
    () => "An error occurred when creating primary contact."
  );
};

export { mutation, useCreatePrimaryContact };
