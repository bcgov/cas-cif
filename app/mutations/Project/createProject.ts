import type { Environment } from "react-relay";
import type {
  createProjectMutationVariables,
  createProjectMutation as CreateProjectMutationType,
} from "createProjectMutation.graphql";
import BaseMutation from "mutations/BaseMutation";
import { graphql } from "react-relay";


const mutation = graphql`
mutation createProjectMutation($input: CreateProjectInput!) {
  createProject(input: $input) {
    formChange {
      id
      newFormData
    }
  }
}
`;

const createProjectMutation = async (
  environment: Environment,
  variables: createProjectMutationVariables
) => {
  const m = new BaseMutation<CreateProjectMutationType>(
    "create-project-mutation"
  );
  return m.performMutation(environment, mutation, variables);
};


export default createProjectMutation;
export { mutation };
