import React from "react";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";

const LoginForm: React.FC = () => {
  const router = useRouter();
  let loginURI = "/login";

  if (router.query.redirectTo)
    loginURI += `?redirectTo=${encodeURIComponent(
      router.query.redirectTo as string
    )}`;

  return (
    <>
      <form action={loginURI} method="post">
        <Button variant="secondary-inverse" type="submit">
          Log in
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

export default LoginForm;
