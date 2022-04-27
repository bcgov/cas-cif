import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { addManagerToRevisionMutation } from "__generated__/addManagerToRevisionMutation.graphql";

export const mutation = graphql`
  mutation addManagerToRevisionMutation(
    $projectRevision: ID!
    $projectRevisionId: Int!
    $newFormData: JSON!
  ) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "project_manager"
        jsonSchemaName: "project_manager"
        operation: CREATE
        projectRevisionId: $projectRevisionId
        newFormData: $newFormData
      }
    ) {
      query {
        projectRevision(id: $projectRevision) {
          ...ProjectManagerFormGroup_revision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

export const useAddManagerToRevisionMutation = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<addManagerToRevisionMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<addManagerToRevisionMutation>(
    mutation,
    () => "An error occurred while adding a manager to the project.",
    commitMutationFn
  );
};

export default useAddManagerToRevisionMutation;
