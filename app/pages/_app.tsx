import { AppProps } from "next/app";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { getInitialPreloadedQuery, getRelayProps } from "relay-nextjs/app";
import { getClientEnvironment } from "../lib/relay/client";
import BCGovTypography from "components/BCGovTypography";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";
import { Suspense } from "react";

import "normalize.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
config.autoAddCss = false;

const clientEnv = getClientEnvironment();
const initialPreloadedQuery = getInitialPreloadedQuery({
  createClientEnvironment: () => getClientEnvironment()!,
});

function MyApp({ Component, pageProps }: AppProps) {
  const relayProps = getRelayProps(pageProps, initialPreloadedQuery);
  const env = relayProps.preloadedQuery?.environment ?? clientEnv!;

  const component =
    typeof window !== "undefined" ? (
      <Suspense fallback="loading">
        <Component {...pageProps} {...relayProps} />
      </Suspense>
    ) : (
      <Component {...pageProps} {...relayProps} />
    );

  return (
    <RelayEnvironmentProvider environment={env}>
      {typeof window !== "undefined" && <SessionExpiryHandler />}
      <BCGovTypography />
      {component}
    </RelayEnvironmentProvider>
  );
}

export default MyApp;
