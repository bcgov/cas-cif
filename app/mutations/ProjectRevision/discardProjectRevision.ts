import { graphql } from "react-relay";

export const mutation = graphql`
  mutation discardProjectRevisionMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      __typename
    }
  }
`;
