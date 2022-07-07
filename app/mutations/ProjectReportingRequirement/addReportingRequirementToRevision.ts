import { graphql } from "react-relay";
import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { addReportingRequirementToRevisionMutation } from "__generated__/addReportingRequirementToRevisionMutation.graphql";

export const mutation = graphql`
  mutation addReportingRequirementToRevisionMutation(
    $connections: [ID!]!
    $projectRevisionId: Int!
    $newFormData: JSON!
  ) {
    createFormChange(
      input: {
        formDataSchemaName: "cif"
        formDataTableName: "reporting_requirement"
        jsonSchemaName: "reporting_requirement"
        operation: CREATE
        projectRevisionId: $projectRevisionId
        newFormData: $newFormData
      }
    ) {
      formChangeEdge @appendEdge(connections: $connections) {
        cursor
        node {
          id
          newFormData
          projectRevisionByProjectRevisionId {
            ...ProjectQuarterlyReportForm_projectRevision
            ...ProjectAnnualReportForm_projectRevision
            ...ProjectMilestoneReportFormGroup_projectRevision
            ...TaskList_projectRevision
          }
        }
      }
    }
  }
`;

export const useAddReportingRequirementToRevision = () =>
  useMutationWithErrorMessage<addReportingRequirementToRevisionMutation>(
    mutation,
    () => "An error occurred while attempting to add the report."
  );
