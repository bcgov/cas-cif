import { graphql } from "react-relay";

const mutation = graphql`
  mutation updateProjectRevisionMutation($input: UpdateProjectRevisionInput!) {
    updateProjectRevision(input: $input) {
      projectRevision {
        id
        projectFormChange {
          id
          newFormData
        }
      }
    }
  }
`;

export { mutation };
