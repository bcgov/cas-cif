import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardMilestoneFormChangeMutation } from "__generated__/discardMilestoneFormChangeMutation.graphql";

const discardMutation = graphql`
  mutation discardMilestoneFormChangeMutation(
    $input: DiscardMilestoneFormChangeInput!
    $reportType: String!
    $connections: [ID!]!
  ) {
    discardMilestoneFormChange(input: $input) {
      formChanges {
        id @deleteEdge(connections: $connections)
        projectRevisionByProjectRevisionId {
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
