import { graphql } from "react-relay";

export const mutation = graphql`
  mutation deleteFormChangeMutation($input: DeleteFormChangeInput!) {
    deleteFormChange(input: $input) {
      __typename
    }
  }
`;
