import React from "react";
import StaticLayout from "components/Layout/StaticLayout";
import { Button } from "@button-inc/bcgov-theme";
import Link from "next/link";

export default function Custom404() {
  return (
    <>
      <StaticLayout>
        <div>
          <h2 className="blue">Page not found</h2>
          <p>Sorry, we couldn&apos;t find the page you were looking for.</p>
          <p>
            <Link href="/" passHref>
              <Button>Return Home</Button>
            </Link>
          </p>
        </div>
      </StaticLayout>
      <style jsx>{`
        div {
          padding-top: 3em;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        p {
          margin: 2em 0;
        }
      `}</style>
    </>
  );
}
