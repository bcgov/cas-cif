import { graphql, Disposable, Environment } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { MutationConfig } from "relay-runtime";
import { createProjectEmissionIntensityFormChangeMutation } from "__generated__/createProjectEmissionIntensityFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createProjectEmissionIntensityFormChangeMutation(
    $connections: [ID!]!
    $input: CreateFormChangeInput!
  ) {
    createFormChange(input: $input) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          rowId
          newFormData
          operation
          changeStatus
          projectRevisionByProjectRevisionId {
            ...TaskList_projectRevision
          }
        }
      }
    }
  }
`;

export const useCreateProjectEmissionIntensityFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createProjectEmissionIntensityFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createProjectEmissionIntensityFormChangeMutation>(
    mutation,
    () =>
      "An error occurred while attempting to create the project emissions intensity report.",
    commitMutationFn
  );
};
