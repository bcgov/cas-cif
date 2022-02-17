import { useMutation, graphql, Disposable, Environment } from "react-relay";
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
        changeReason: "Created from operator form"
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
  return useMutation<createEditOperatorFormChangeMutation>(
    mutation,
    commitMutationFn
  );
};

export default useCreateEditOperatorFormChange;
