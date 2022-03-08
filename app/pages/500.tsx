import React from "react";
import StaticLayout from "components/Layout/StaticLayout";
import getConfig from "next/config";
import Link from "next/link";
import { Button } from "@button-inc/bcgov-theme";
import { useRouter } from "next/router";
import Alert from "@mui/material/Alert";

const Custom500 = () => {
  const supportEmail = getConfig()?.publicRuntimeConfig.SUPPORT_EMAIL;
  const mailtoLink = `mailto:${supportEmail}?subject=Reporting an error`;

  const router = useRouter();

  return (
    <>
      <StaticLayout>
        <Alert severity="error" icon={false}>
          <h3>Sorry, something went wrong</h3>
          <p>
            An unexpected error occurred. If this error persists, contact us at{" "}
            <Link href={mailtoLink}>
              <a className={"email"}>{supportEmail}</a>
            </Link>{" "}
            and tell us what happened. Meanwhile you can{" "}
            <Link href={"javascript:;"}>
              <a onClick={() => router.back()}>refresh this page</a>
            </Link>{" "}
            or try again later.
          </p>
          <p>
            <Link href="/" passHref>
              <Button>Return Home</Button>
            </Link>
          </p>
        </Alert>
      </StaticLayout>
      <style jsx>{`
        a.email {
          font-weight: bold;
        }
      `}</style>
    </>
  );
};

export default Custom500;
