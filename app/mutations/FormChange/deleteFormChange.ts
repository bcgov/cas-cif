import { graphql } from "react-relay";

export const mutation = graphql`
  mutation deleteFormChangeMutation(
    $connections: [ID!]!
    $input: DeleteFormChangeInput!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId @deleteEdge(connections: $connections)
    }
  }
`;
