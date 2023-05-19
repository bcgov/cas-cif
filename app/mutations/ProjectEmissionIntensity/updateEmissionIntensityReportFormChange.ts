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
        calculatedEiPerformance
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
        }
        paymentPercentage
      }
    }
  }
`;

const useUpdateEmissionIntensityReportFormChange = () => {
  return useDebouncedMutation<updateEmissionIntensityReportFormChangeMutation>(
    mutation,
    () =>
      "An error occurred when updating one of the forms associated to a emissions intensity reporting requirement."
  );
};

export { mutation, useUpdateEmissionIntensityReportFormChange };
