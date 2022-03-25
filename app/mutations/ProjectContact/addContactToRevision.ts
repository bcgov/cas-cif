import { graphql, useMutation } from "react-relay";
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
          newFormData
        }
      }
    }
  }
`;

const useAddContactToRevision = () => {
  return useMutation<addContactToRevisionMutation>(mutation);
};

export { mutation, useAddContactToRevision };
