import { Button } from "@button-inc/bcgov-theme";
import React from "react";

const LogoutForm: React.FC = () => {
  return (
    <>
      <form action="/logout" method="post">
        <Button variant="secondary-inverse" type="submit">
          Log out
        </Button>
      </form>
      <style jsx>{`
        form {
          margin-top: auto;
          margin-bottom: auto;
        }
      `}</style>
    </>
  );
};

export default LogoutForm;
