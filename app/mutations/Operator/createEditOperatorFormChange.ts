import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { createEditOperatorFormChangeMutation } from "__generated__/createEditOperatorFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createEditOperatorFormChangeMutation($operatorRowId: Int!) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "operator"
        jsonSchemaName: "operator"
        operation: UPDATE
        formDataRecordId: $operatorRowId
      }
    ) {
      formChange {
        id
      }
    }
  }
`;

export const useCreateEditOperatorFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createEditOperatorFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createEditOperatorFormChangeMutation>(
    mutation,
    () => "An error occured",
    commitMutationFn
  );
};

export default useCreateEditOperatorFormChange;
