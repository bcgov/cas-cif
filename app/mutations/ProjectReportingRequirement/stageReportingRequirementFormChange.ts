import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { stageReportingRequirementFormChangeMutation } from "__generated__/stageReportingRequirementFormChangeMutation.graphql";

const mutation = graphql`
  mutation stageReportingRequirementFormChangeMutation(
    $input: StageFormChangeInput!
    $reportType: String!
  ) {
    stageFormChange(input: $input) {
      formChange {
        id
        newFormData
        changeStatus
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
        }
      }
    }
  }
`;

export const useStageReportingRequirementFormChange = () => {
  return useMutationWithErrorMessage<stageReportingRequirementFormChangeMutation>(
    mutation,
    () => "An error occurred when staging the form change."
  );
};
