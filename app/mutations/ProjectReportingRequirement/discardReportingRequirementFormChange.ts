import useConfigurableDiscardFormChange from "hooks/useConfigurableDiscardFormChange";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { discardReportingRequirementFormChangeMutation } from "__generated__/discardReportingRequirementFormChangeMutation.graphql";
import { updateReportingRequirementFormChangeMutation } from "__generated__/updateReportingRequirementFormChangeMutation.graphql";
import { useUpdateReportingRequirementFormChange } from "./updateReportingRequirementFormChange";

const discardMutation = graphql`
  mutation discardReportingRequirementFormChangeMutation(
    $connections: [ID!]!
    $input: DeleteFormChangeInput!
    $reportType: String!
  ) {
    deleteFormChange(input: $input) {
      deletedFormChangeId @deleteEdge(connections: $connections)
      formChange {
        projectRevisionByProjectRevisionId {
          upcomingReportingRequirementFormChange(reportType: $reportType) {
            ...ReportDueIndicator_formChange
          }
        }
      }
    }
  }
`;

const useDeleteReportingRequirementFormChange = () =>
  useMutationWithErrorMessage<discardReportingRequirementFormChangeMutation>(
    discardMutation,
    () => "An error occurred when deleting."
  );

const useDiscardReportingRequirementFormChange = (
  reportType: string,
  connectionId: string
) =>
  useConfigurableDiscardFormChange<
    discardReportingRequirementFormChangeMutation,
    updateReportingRequirementFormChangeMutation
  >(
    useDeleteReportingRequirementFormChange,
    useUpdateReportingRequirementFormChange,
    { reportType: reportType },
    connectionId
  );

export default useDiscardReportingRequirementFormChange;
