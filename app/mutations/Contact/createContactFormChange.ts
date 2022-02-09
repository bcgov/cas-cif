import { useMutation, graphql, Disposable } from "react-relay";
import { Environment, MutationConfig } from "relay-runtime";
import { createContactFormChangeMutation } from "__generated__/createContactFormChangeMutation.graphql";

export const mutation = graphql`
  mutation createContactFormChangeMutation {
    createFormChange(
      input: {
        formChange: {
          formDataSchemaName: "cif"
          formDataTableName: "contact"
          jsonSchemaName: "contact"
          operation: "INSERT"
          changeReason: "Created from contact form"
        }
      }
    ) {
      formChange {
        id
      }
    }
  }
`;

export const useCreateContactFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<createContactFormChangeMutation>
  ) => Disposable
) => {
  return useMutation(mutation, commitMutationFn);
};

export default useCreateContactFormChange;
