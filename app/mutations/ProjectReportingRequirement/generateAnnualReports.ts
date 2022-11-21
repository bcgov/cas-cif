import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { generateAnnualReportsMutation } from "__generated__/generateAnnualReportsMutation.graphql";

const mutation = graphql`
  mutation generateAnnualReportsMutation($input: GenerateAnnualReportsInput!) {
    generateAnnualReports(input: $input) {
      formChanges {
        projectRevisionByProjectRevisionId {
          ...ProjectAnnualReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

export const useGenerateAnnualReports = () => {
  return useMutationWithErrorMessage<generateAnnualReportsMutation>(
    mutation,
    () => "An error occurred when generating annual reports."
  );
};
