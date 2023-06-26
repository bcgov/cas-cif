import React from "react";
import { useRouter } from "next/router";
import { Button } from "@button-inc/bcgov-theme";
import { getExternalUserLandingPageRoute } from "routes/pageRoutes";

interface Props {
  isExternal?: boolean;
}

const LoginForm: React.FC<Props> = ({ isExternal }) => {
  const router = useRouter();
  let loginURI = "/login";

  if (router.query.redirectTo)
    loginURI += `?redirectTo=${encodeURIComponent(
      router.query.redirectTo as string
    )}`;
  else if (isExternal)
    loginURI += `?redirectTo=${encodeURIComponent(
      getExternalUserLandingPageRoute().pathname as string
    )}`;

  return (
    <>
      <form id="login-buttons" action={loginURI} method="post">
        <Button
          type="submit"
          variant={
            router.pathname.includes("login-redirect")
              ? "secondary-inverse"
              : isExternal && "secondary"
          }
        >
          {isExternal ? "External User Login" : "Administrator Login"}
        </Button>
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
