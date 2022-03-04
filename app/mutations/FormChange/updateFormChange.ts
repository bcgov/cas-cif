import { Environment } from "react-relay";
import type {
  updateFormChangeMutationVariables,
  updateFormChangeMutation as updateFormChangeMutationType,
} from "updateFormChangeMutation.graphql";
import BaseMutation from "mutations/BaseMutation";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        projectRevisionByProjectRevisionId {
          ...ProjectContactForm_projectRevision
        }
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

const useUpdateFormChange = () => {
  return useDebouncedMutation<updateFormChangeMutationType>(mutation);
};

export default updateFormChangeMutation;
export { mutation, useUpdateFormChange };
