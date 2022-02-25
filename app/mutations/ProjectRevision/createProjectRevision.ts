import { graphql, useMutation } from "react-relay";
import { createProjectRevisionMutation } from "__generated__/createProjectRevisionMutation.graphql";

export const mutation = graphql`
  mutation createProjectRevisionMutation($projectId: Int!) {
    createProjectRevision(input: { projectId: $projectId }) {
      projectRevision {
        id
      }
    }
  }
`;

export const useCreateProjectRevision = () =>
  useMutation<createProjectRevisionMutation>(mutation);
