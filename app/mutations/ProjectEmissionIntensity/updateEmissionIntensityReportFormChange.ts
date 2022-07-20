import { updateEmissionIntensityReportFormChangeMutation } from "updateEmissionIntensityReportFormChangeMutation.graphql";
import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";

const mutation = graphql`
  mutation updateEmissionIntensityReportFormChangeMutation(
    $input: UpdateFormChangeInput!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectManagerFormGroup_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useUpdateEmissionIntensityReportFormChange = () => {
  return useDebouncedMutation<updateEmissionIntensityReportFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project manager form."
  );
};

export { mutation, useUpdateEmissionIntensityReportFormChange };
