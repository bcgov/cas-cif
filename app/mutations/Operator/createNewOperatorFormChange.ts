import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { createNewOperatorFormChangeMutation } from "__generated__/createNewOperatorFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createNewOperatorFormChangeMutation {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "operator"
        jsonSchemaName: "operator"
        operation: CREATE
      }
    ) {
      formChange {
        id
      }
    }
  }
`;

export const useCreateNewOperatorFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createNewOperatorFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createNewOperatorFormChangeMutation>(
    mutation,
    () => "An error occurred while attempting to create the operator.",
    commitMutationFn
  );
};
