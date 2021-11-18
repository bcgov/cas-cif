import type { Environment } from "react-relay";
import type {
  updateFormChangeMutationVariables,
  updateFormChangeMutation as updateFormChangeMutationType,
} from "updateFormChangeMutation.graphql";
import BaseMutation from "mutations/BaseMutation";
import { graphql } from "react-relay";

const mutation = graphql`
  mutation updateFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
      }
    }
  }
`;

const updateFormChangeMutation = async (
  environment: Environment,
  variables: updateFormChangeMutationVariables
) => {
  const optimisticResponse = {
    updateFormChange: {
      formChange: {
        id: variables.input.id,
        newFormData: {
          ...variables.input.formChangePatch.newFormData,
        },
      },
    },
  };

  const m = new BaseMutation<updateFormChangeMutationType>(
    "update-form-change-mutation"
  );
  return m.performMutation(
    environment,
    mutation,
    variables,
    optimisticResponse
  );
};

export default updateFormChangeMutation;
export { mutation };
