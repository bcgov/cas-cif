import type {Environment} from 'react-relay';
import type {CreateProjectInput, createProjectMutation} from 'createProjectMutation.graphql';

import {commitMutation, graphql} from 'react-relay';

export default function commitProjectMutation(
  environment: Environment,
  input: CreateProjectInput,
) {
  return commitMutation<createProjectMutation>(environment, {
    mutation: graphql`
      mutation createProjectMutation($input: CreateProjectInput!) {
        createProject(input: $input) {
          query {
            allFormChanges(filter: {changeStatus: { equalTo: "pending" }}) {
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
          }
        }
      }
    `,
    variables: {input},
    onCompleted: response => {console.log(response)},
    onError: error => {console.error(error)}
  });
};
