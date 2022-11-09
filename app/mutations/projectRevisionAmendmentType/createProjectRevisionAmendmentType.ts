import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectRevisionAmendmentTypeMutation } from "__generated__/createProjectRevisionAmendmentTypeMutation.graphql";

export const mutation = graphql`
  mutation createProjectRevisionAmendmentTypeMutation(
    $projectRevisionAmendmentType: ProjectRevisionAmendmentTypeInput!
  ) {
    createProjectRevisionAmendmentType(
      input: { projectRevisionAmendmentType: $projectRevisionAmendmentType }
    ) {
      clientMutationId
    }
  }
`;

export const useCreateProjectRevisionAmendment = () =>
  useMutationWithErrorMessage<createProjectRevisionAmendmentTypeMutation>(
    mutation,
    () => "An error occurred while attempting to create the project revision."
  );
