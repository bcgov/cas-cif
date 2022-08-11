import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardFundingParameterFormChangeMutation } from "__generated__/discardFundingParameterFormChangeMutation.graphql";

const discardMutation = graphql`
  mutation discardFundingParameterFormChangeMutation(
    $input: DiscardFundingParameterFormChangeInput!
    $reportType: String!
    $connections: [ID!]!
  ) {
    discardFundingParameterFormChange(input: $input) {
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

const useDiscardFundingParameterFormChange = () =>
  useMutationWithErrorMessage<discardFundingParameterFormChangeMutation>(
    discardMutation,
    () => "An error occurred when deleting."
  );

export default useDiscardFundingParameterFormChange;
