import { graphql } from "react-relay";
import { updateProjectSummaryReportFormChangeMutation } from "updateProjectSummaryReportFormChangeMutation.graphql";
import useDebouncedMutation from "mutations/useDebouncedMutation";

/**
 *
 * Specific mutation for a form_change for a project.
 * Includes whether the suggested proposal reference is unique in the system.
 *
 */

const mutation = graphql`
  mutation updateProjectSummaryReportFormChangeMutation(
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
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
        }
        asReportingRequirement {
          reportDueDate
        }
      }
    }
  }
`;

const useUpdateProjectSummaryReportFormChangeMutation = () => {
  return useDebouncedMutation<updateProjectSummaryReportFormChangeMutation>(
    mutation,
    () => "An error occurred when updating the project summary report."
  );
};

export { mutation, useUpdateProjectSummaryReportFormChangeMutation };
