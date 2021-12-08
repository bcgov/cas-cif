import type { Environment } from "react-relay";
import type {
  updateProjectRevisionMutationVariables,
  updateProjectRevisionMutation as updateProjectRevisionMutationType,
} from "updateProjectRevisionMutation.graphql";
import BaseMutation from "mutations/BaseMutation";
import { graphql } from "react-relay";

const mutation = graphql`
  mutation updateProjectRevisionMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        formChangesByProjectRevisionId {
          edges {
            node {
              id
              newFormData
              formDataSchemaName
              formDataTableName
            }
          }
        }
      }
    }
  }
`;

const updateProjectRevisionMutation = async (
  environment: Environment,
  variables: updateProjectRevisionMutationVariables
) => {
  const optimisticResponse = {
    updateProjectRevision: {
      projectRevision: {
        id: variables.input.id,
      },
    },
  };

  const m = new BaseMutation<updateProjectRevisionMutationType>(
    "update-project-revision-mutation"
  );
  return m.performMutation(
    environment,
    mutation,
    variables,
    optimisticResponse
  );
};

export default updateProjectRevisionMutation;
export { mutation };
