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
      <form id="login-buttons" action={loginURI} method="post">
        {isExternal && router.pathname.includes("login-redirect") ? (
          <Button type="submit" variant="secondary-inverse">
            External User Login
          </Button>
        ) : isExternal ? (
          <Button type="submit" variant="secondary">
            External User Login
          </Button>
        ) : router.pathname.includes("login-redirect") ? (
          <Button type="submit" variant="secondary-inverse">
            Administrator Login
          </Button>
        ) : (
          <Button type="submit">Administrator Login</Button>
        )}
      </form>
      <style jsx>{`
        #login-buttons {
          margin: 0px;
        }
      `}</style>
    </>
  );
};

export default LoginForm;
