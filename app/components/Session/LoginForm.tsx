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
        <Button type="submit">Administrator Login</Button>
      </form>
    </>
  );
};

export default LoginForm;
