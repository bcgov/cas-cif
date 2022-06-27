import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardMilestoneFormChangeMutation } from "__generated__/discardMilestoneFormChangeMutation.graphql";

const discardMutation = graphql`
  mutation discardMilestoneFormChangeMutation(
    $input: DiscardMilestoneFormChangeInput!
    $reportType: String!
  ) {
    discardMilestoneFormChange(input: $input) {
      formChanges {
        projectRevisionByProjectRevisionId {
          ...ProjectMilestoneReportForm_projectRevision
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useDiscardMilestoneFormChange = () =>
  useMutationWithErrorMessage<discardMilestoneFormChangeMutation>(
    discardMutation,
    () => "An error occurred when deleting."
  );

export default useDiscardMilestoneFormChange;
