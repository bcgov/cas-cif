import type { Environment } from "react-relay";
import type {
  UpdateFormChangeInput,
  updateFormChangeMutation,
} from "updateFormChangeMutation.graphql";

import { commitMutation, graphql } from "react-relay";

export default function commitFormChangeMutation(
  environment: Environment,
  input: UpdateFormChangeInput
) {
  return commitMutation<updateFormChangeMutation>(environment, {
    mutation: graphql`
      mutation updateFormChangeMutation($input: UpdateFormChangeInput!) {
        updateFormChange(input: $input) {
          query {
            allFormChanges(filter: { changeStatus: { equalTo: "pending" } }) {
              edges {
                node {
                  id
                  newFormData
                  operation
                  formDataSchemaName
                  formDataTableName
                  formDataRecordId
                  changeStatus
                  changeReason
                }
              }
            }
            allProjects {
              edges {
                node {
                  id
                  cifIdentifier
                  description
                }
              }
            }
          }
        }
      }
    `,
    variables: { input },
    onCompleted: (response) => {
      console.log(response);
    },
    onError: (error) => {
      console.error(error);
    },
  });
}
