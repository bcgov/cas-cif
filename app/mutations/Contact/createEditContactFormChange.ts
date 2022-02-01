import { useMutation, graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { createEditContactFormChangeMutation } from "__generated__/createEditContactFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createEditContactFormChangeMutation($contactRowId: Int!) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "contact"
        jsonSchemaName: "contact"
        operation: "UPDATE"
        changeReason: "Created from contact form"
        formDataRecordId: $contactRowId
      }
    ) {
      formChange {
        id
      }
    }
  }
`;

export const useCreateEditContactFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createEditContactFormChangeMutation>
  ) => Disposable
) => {
  return useMutation<createEditContactFormChangeMutation>(
    mutation,
    commitMutationFn
  );
};

export default useCreateEditContactFormChange;
