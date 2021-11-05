import { graphql } from "react-relay";

export const createUserFromSessionMutation = graphql`
  mutation createUserFromSessionMutation($input: CreateUserFromSessionInput!) {
    createUserFromSession(input: $input) {
      cifUser {
        id
        firstName
        lastName
        emailAddress
      }
    }
  }
`;
