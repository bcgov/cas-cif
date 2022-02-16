import { useMutation, graphql, Disposable, Environment } from "react-relay";
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
        changeReason: "Created from contact form"
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
  return useMutation<createNewContactFormChangeMutation>(
    mutation,
    commitMutationFn
  );
};
