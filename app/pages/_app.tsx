import { AppProps } from "next/app";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { getInitialPreloadedQuery, getRelayProps } from "relay-nextjs/app";
import { getClientEnvironment } from "../lib/relay/client";
import BCGovTypography from "components/BCGovTypography";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";
import { Suspense, useEffect, useState } from "react";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./500";
import { ErrorContext } from "contexts/ErrorContext";

import "normalize.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import LoadingFallback from "components/Layout/LoadingFallback";
config.autoAddCss = false;

const clientEnv = getClientEnvironment();
const initialPreloadedQuery = getInitialPreloadedQuery({
  createClientEnvironment: () => getClientEnvironment()!,
});

function MyApp({ Component, pageProps }: AppProps) {
  const [error, setError] = useState(null);
  const value = { error, setError };
  useEffect(() => {
    setError(null);
  }, [Component]);

  const relayProps = getRelayProps(pageProps, initialPreloadedQuery);
  const env = relayProps.preloadedQuery?.environment ?? clientEnv!;

  const component =
    typeof window !== "undefined" ? (
      <Suspense fallback={<LoadingFallback />}>
        <Component {...pageProps} {...relayProps} />
      </Suspense>
    ) : (
      <Component {...pageProps} {...relayProps} />
    );

  return (
    <ErrorContext.Provider value={value}>
      <Sentry.ErrorBoundary fallback={ErrorFallback}>
        <RelayEnvironmentProvider environment={env}>
          {typeof window !== "undefined" && <SessionExpiryHandler />}
          <BCGovTypography />
          {component}
        </RelayEnvironmentProvider>
      </Sentry.ErrorBoundary>
    </ErrorContext.Provider>
  );
}

export default MyApp;
