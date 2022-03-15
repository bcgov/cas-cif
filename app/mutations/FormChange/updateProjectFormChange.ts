import { graphql } from "react-relay";

/**
 *
 * Specific mutation for a form_change for a project.
 * Includes whether the suggested proposal reference is unique in the system.
 *
 */

const mutation = graphql`
  mutation updateProjectFormChangeMutation($input: UpdateFormChangeInput!) {
    updateFormChange(input: $input) {
      formChange {
        id
        newFormData
        operation
        isUniqueValue(columnName: "proposalReference")
        projectRevisionByProjectRevisionId {
          ...ProjectContactForm_projectRevision
          ...ProjectManagerFormGroup_revision
        }
      }
    }
  }
`;

export { mutation };
