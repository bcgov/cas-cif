import { graphql } from "react-relay";

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

export { mutation };
