import { graphql } from "react-relay";

import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectMutation } from "__generated__/createProjectMutation.graphql";

const mutation = graphql`
  mutation createProjectMutation($input: CreateProjectInput!) {
    createProject(input: $input) {
      projectRevision {
        id
      }
    }
  }
`;

const useCreateProjectMutation = () =>
  useMutationWithErrorMessage<createProjectMutation>(
    mutation,
    () => "An error occurred while attempting to create the project."
  );

export { mutation, useCreateProjectMutation };
