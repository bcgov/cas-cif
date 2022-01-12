import { graphql, useMutation, UseMutationConfig } from "react-relay";
import { Disposable, MutationParameters } from "relay-runtime";

const mutation = graphql`
  mutation discardProjectRevisionMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      __typename
    }
  }
`;

function useDiscardProjectMutation<TMutation extends MutationParameters>(): [
  (
    projectRevisionId: string,
    config: Partial<UseMutationConfig<TMutation>>
  ) => Disposable,
  boolean
] {
  const [updateMutation, isInFlight] = useMutation(mutation);

  const discardProjectMutation = (
    projectRevisionId: string,
    config: Partial<UseMutationConfig<TMutation>>
  ) => {
    return updateMutation({
      variables: {
        input: {
          id: projectRevisionId,
          projectRevisionPatch: {
            deletedAt: new Date().toISOString(),
          },
        },
      },
      ...config,
    });
  };

  return [discardProjectMutation, isInFlight];
}

export default useDiscardProjectMutation;
