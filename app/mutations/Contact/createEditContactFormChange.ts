import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql, Disposable, Environment } from "react-relay";
import { MutationConfig } from "relay-runtime";
import { createEditContactFormChangeMutation } from "__generated__/createEditContactFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createEditContactFormChangeMutation($contactRowId: Int!) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "contact"
        jsonSchemaName: "contact"
        operation: UPDATE
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
  return useMutationWithErrorMessage<createEditContactFormChangeMutation>(
    mutation,
    () => "An error occurred when editing a contact.",
    commitMutationFn
  );
};

export default useCreateEditContactFormChange;
