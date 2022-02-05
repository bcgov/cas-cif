import { graphql, useMutation } from "react-relay";

export const mutation = graphql`
  mutation deleteProjectRevisionMutation($input: DeleteProjectRevisionInput!) {
    deleteProjectRevision(input: $input) {
      __typename
    }
  }
`;

export const useDeleteProjectRevisionMutation = () => {
  return useMutation(mutation);
};
