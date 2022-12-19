import type { createProjectMutation } from "createProjectMutation.graphql";
import { graphql } from "react-relay";

import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";

const mutation = graphql`
  mutation createProjectMutation($input: CreateProjectInput!) {
    createProject(input: $input) {
      projectRevision {
        id
        projectFormChange {
          id
          rowId
        }
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
