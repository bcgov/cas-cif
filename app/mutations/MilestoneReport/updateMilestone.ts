import { graphql } from "react-relay";
import useDebouncedMutation from "mutations/useDebouncedMutation";
import { updateMilestoneFormChangeMutation } from "__generated__/updateMilestoneFormChangeMutation.graphql";

const mutation = graphql`
  mutation updateMilestoneFormChangeMutation(
    $input: UpdateMilestoneFormChangeInput!
    $reportType: String!
  ) {
    updateMilestoneFormChange(input: $input) {
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

const useUpdateMilestone = () => {
  return useDebouncedMutation<updateMilestoneFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project milestone form."
  );
};

export { mutation, useUpdateMilestone };
