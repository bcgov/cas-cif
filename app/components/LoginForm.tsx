import React from "react";
import { useRouter } from "next/router";

const LoginForm: React.FC = ({ children }) => {
  const router = useRouter();
  let loginURI = "/login";

  if (router.query.redirectTo)
    loginURI += `?redirectTo=${encodeURIComponent(
      router.query.redirectTo as string
    )}`;

  return (
    <>
      <form action={loginURI} method="post">
        {children}
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
