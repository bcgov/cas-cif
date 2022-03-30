import { graphql, Disposable, Environment } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { MutationConfig } from "relay-runtime";
import { createNewContactFormChangeMutation } from "__generated__/createNewContactFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createNewContactFormChangeMutation {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "contact"
        jsonSchemaName: "contact"
        operation: CREATE
      }
    ) {
      formChange {
        id
      }
    }
  }
`;

export const useCreateNewContactFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createNewContactFormChangeMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<createNewContactFormChangeMutation>(
    mutation,
    () => "An error occurred when editing a contact.",
    commitMutationFn
  );
};
