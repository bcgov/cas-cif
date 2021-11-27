import React from "react";
import { graphql, useFragment } from "react-relay";
import type { UserProfile_user$key } from "__generated__/UserProfile_user.graphql";
import Button from "@button-inc/bcgov-theme/Button";
import Grid from "@button-inc/bcgov-theme/Grid";

interface Props {
  user: UserProfile_user$key;
}

const UserProfile: React.FC<Props> = ({ user }) => {
  const { firstName, lastName, emailAddress } =
    useFragment(
      graphql`
        fragment UserProfile_user on CifUser {
          firstName
          lastName
          emailAddress
        }
      `,
      user
    ) || {};

  if (user === null) return null;

  return (
    <>
      <Grid className="name-display" justify="end">
        <Grid.Row>
          {lastName}, {firstName}
        </Grid.Row>
        <Grid.Row>{emailAddress}</Grid.Row>
      </Grid>
      <form action="/logout" method="post">
        <Button variant="secondary-inverse" type="submit">
          Logout
        </Button>
      </form>
      <style jsx>{`
        :global(.name-display) {
          margin-right: 20px;
        }
        form {
          margin-top: auto;
          margin-bottom: auto;
        }
      `}</style>
    </>
  );
};

export default UserProfile;
