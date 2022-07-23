import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardEmissionIntenstiryReportFormChangeMutation } from "__generated__/discardEmissionIntenstiryReportFormChangeMutation.graphql";

const discardMutation = graphql`
  mutation discardEmissionIntenstiryReportFormChangeMutation(
    $input: DiscardEmissionIntensityReportInput!
    $reportType: String!
    $connections: [ID!]!
  ) {
    discardEmissionIntensityReport(input: $input) {
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

const useDiscardProjectEmissionIntensityFormChange = () =>
  useMutationWithErrorMessage<discardEmissionIntenstiryReportFormChangeMutation>(
    discardMutation,
    () => "An error occurred when deleting."
  );

export default useDiscardProjectEmissionIntensityFormChange;
