import useMutationWithErrorMessage from "mutations/useMutationWithErrorMessage";
import { graphql } from "react-relay";
import { stageFormChangeMutation } from "__generated__/stageFormChangeMutation.graphql";

const mutation = graphql`
  mutation stageFormChangeMutation($input: StageFormChangeInput!) {
    stageFormChange(input: $input) {
      formChange {
        id
        rank
        newFormData
        changeStatus
        projectRevisionByProjectRevisionId {
          ...TaskList_projectRevision
          totalProjectValue
        }
      }
    }
  }
`;

export const useStageFormChange = () => {
  return useMutationWithErrorMessage<stageFormChangeMutation>(
    mutation,
    () => "An error occurred when staging the form change."
  );
};
