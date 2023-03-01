import React from "react";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { getExternalUserLandingPageRoute } from "routes/pageRoutes";

interface Props {
  isExternal?: boolean;
}

const LoginForm: React.FC<Props> = ({ isExternal }) => {
  const router = useRouter();
  let loginURI = isExternal
    ? `/login?redirectTo=${getExternalUserLandingPageRoute().pathname}`
    : "/login";

  if (router.query.redirectTo)
    loginURI += `?redirectTo=${encodeURIComponent(
      router.query.redirectTo as string
    )}`;

  return (
    <>
      <form action={loginURI} method="post">
        {isExternal ? (
          <Button type="submit" variant="secondary">
            External User Login
          </Button>
        ) : (
          <Button type="submit">Administrator Login</Button>
        )}
      </form>
    </>
  );
};

export default LoginForm;
