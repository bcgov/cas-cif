import { graphql } from "react-relay";

export const mutation = graphql`
  mutation discardFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      __typename
    }
  }
`;
