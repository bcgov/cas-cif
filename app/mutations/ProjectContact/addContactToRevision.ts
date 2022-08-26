import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { addContactToRevisionMutation } from "__generated__/addContactToRevisionMutation.graphql";

const mutation = graphql`
  mutation addContactToRevisionMutation(
    $connections: [ID!]!
    $input: AddContactToRevisionInput!
  ) {
    addContactToRevision(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          rowId
          ...ContactForm_formChange
          projectRevisionByProjectRevisionId {
            ...ProjectContactForm_projectRevision
            ...TaskList_projectRevision
          }
        }
      }
    }
  }
`;

const useAddContactToRevision = () => {
  return useMutationWithErrorMessage<addContactToRevisionMutation>(
    mutation,
    () => "An error occurred while adding the contact to the revision."
  );
};

export { mutation, useAddContactToRevision };
