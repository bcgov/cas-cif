import { graphql, Disposable, Environment } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { MutationConfig } from "relay-runtime";
import { addEmissionIntensityReportToRevisionMutation } from "__generated__/addEmissionIntensityReportToRevisionMutation.graphql";

const mutation = graphql`
  mutation addEmissionIntensityReportToRevisionMutation(
    $input: AddEmissionIntensityReportToRevisionInput!
  ) {
    addEmissionIntensityReportToRevision(input: $input) {
      formChanges {
        id
        calculatedEiPerformance
        rowId
        newFormData
        paymentPercentage
        holdbackAmountToDate
        actualPerformanceMilestoneAmount
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
          ...ProjectEmissionIntensityReportForm_projectRevision
        }
      }
    }
  }
`;

export const useCreateProjectEmissionIntensityFormChange = (
  commitMutationFn?: (
    environment: Environment,
    config: MutationConfig<addEmissionIntensityReportToRevisionMutation>
  ) => Disposable
) => {
  return useMutationWithErrorMessage<addEmissionIntensityReportToRevisionMutation>(
    mutation,
    () =>
      "An error occurred while attempting to create the project emissions intensity report.",
    commitMutationFn
  );
};
