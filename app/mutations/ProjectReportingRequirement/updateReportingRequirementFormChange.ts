import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateReportingRequirementFormChangeMutation } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";

const mutation = graphql`
  mutation updateReportingRequirementFormChangeMutation(
    $input: UpdateFormChangeInput!
    $reportType: String!
  ) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
          ...ProjectMilestoneReportForm_projectRevision
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
        }
        asReportingRequirement {
          ...CollapsibleReport_reportingRequirement
        }
      }
    }
  }
`;

const useUpdateReportingRequirementFormChange = () => {
  return useDebouncedMutation<updateReportingRequirementFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project reports form."
  );
};

export { mutation, useUpdateReportingRequirementFormChange };
