import { graphql } from "react-relay";

const mutation = graphql`
  mutation deletePendingFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChangeEdge {
        cursor
        node {
          id
          deletedAt
          newFormData
        }
      }
    }
  }
`;

export { mutation };
