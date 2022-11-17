import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { generateQuarterlyReportsMutation } from "__generated__/generateQuarterlyReportsMutation.graphql";

const mutation = graphql`
  mutation generateQuarterlyReportsMutation(
    $input: GenerateQuarterlyReportsInput!
  ) {
    generateQuarterlyReports(input: $input) {
      formChanges {
        projectRevisionByProjectRevisionId {
          ...ProjectQuarterlyReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

export const useGenerateQuarterlyReports = () => {
  return useMutationWithErrorMessage<generateQuarterlyReportsMutation>(
    mutation,
    () => "An error occurred when generating quarterly reports."
  );
};
