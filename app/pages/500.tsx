import React from "react";
import StaticLayout from "components/Layout/StaticLayout";
import getConfig from "next/config";
import Link from "next/link";
import { Button, Alert } from "@button-inc/bcgov-theme";
import { useRouter } from "next/router";

const Custom500 = () => {
  const supportEmail = getConfig()?.publicRuntimeConfig?.SUPPORT_EMAIL;
  const mailtoLink = `mailto:${supportEmail}?subject=Reporting an error`;

  const router = useRouter();

  return (
    <>
      <StaticLayout>
        <Alert variant={"danger"}>
          <h2>Sorry, something went wrong</h2>
          <p>
            An unexpected error occurred. If this error persists, contact us at{" "}
            <a href={mailtoLink} className={"email"}>
              {supportEmail}
            </a>{" "}
            and tell us what happened. Meanwhile you can{" "}
            <a href={"javascript:;"} onClick={() => router.back()}>
              go back to the previous page
            </a>{" "}
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
