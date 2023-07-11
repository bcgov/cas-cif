import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { createEmissionIntensityReportMutation } from "__generated__/createEmissionIntensityReportMutation.graphql";

const mutation = graphql`
  mutation createEmissionIntensityReportMutation(
    $input: CreateFormChangeInput!
  ) {
    createFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectEmissionIntensityReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useCreateEmissionIntensityReport = () => {
  return useMutationWithErrorMessage<createEmissionIntensityReportMutation>(
    mutation,
    () =>
      "An error occurred while attempting to create the project emissions intensity report."
  );
};

export { mutation, useCreateEmissionIntensityReport };
