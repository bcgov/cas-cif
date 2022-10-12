import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { generateReportsMutation } from "__generated__/generateReportsMutation.graphql";

const mutation = graphql`
  mutation generateReportsMutation($input: GenerateReportsInput!) {
    generateReports(input: $input) {
      formChanges {
        projectRevisionByProjectRevisionId {
          ...ProjectQuarterlyReportForm_projectRevision
          ...ProjectAnnualReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

export const useGenerateReports = () => {
  return useMutationWithErrorMessage<generateReportsMutation>(
    mutation,
    () => "An error occurred when generating reports."
  );
};
