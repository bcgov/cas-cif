import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { createProjectSummaryReportMutation } from "createProjectSummaryReportMutation.graphql";

const mutation = graphql`
  mutation createProjectSummaryReportMutation($input: CreateFormChangeInput!) {
    createFormChange(input: $input) {
      formChange {
        id
        formDataRecordId
        newFormData
        operation
        changeStatus
        projectRevisionByProjectRevisionId {
          ...ProjectSummaryReportForm_projectRevision
          ...TaskList_projectRevision
        }
      }
    }
  }
`;

const useCreateProjectSummaryReport = () => {
  return useMutationWithErrorMessage<createProjectSummaryReportMutation>(
    mutation,
    () => "An error occured while adding the Project Summary to the revision."
  );
};

export { mutation, useCreateProjectSummaryReport };
