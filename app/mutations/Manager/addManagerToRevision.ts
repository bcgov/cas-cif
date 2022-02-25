import { useMutation, graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { addManagerToRevisionMutation } from "__generated__/addManagerToRevisionMutation.graphql";

export const mutation = graphql`
  mutation addManagerToRevisionMutation($projectRevisionId: Int! $newFormData: JSON!) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "project_manager"
        jsonSchemaName: "project_manager"
        operation: CREATE
        changeReason: "Add manager to project revision from project manager form"
        projectRevisionId: $projectRevisionId
        newFormData: $newFormData
      }
    ) {
      formChange {
          id
          newFormData
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
  return useMutation<addManagerToRevisionMutation>(
    mutation,
    commitMutationFn
  );
};

export default useAddManagerToRevisionMutation;
