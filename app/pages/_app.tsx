import { AppProps } from "next/app";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { getInitialPreloadedQuery, getRelayProps } from "relay-nextjs/app";
import { getClientEnvironment } from "../lib/relay/client";
import BCGovTypography from "components/BCGovTypography";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";
import { Suspense } from "react";
import * as Sentry from "@sentry/react";
import ErrorFallback from "./500";

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
    <Sentry.ErrorBoundary fallback={ErrorFallback}>
      <RelayEnvironmentProvider environment={env}>
        {typeof window !== "undefined" && <SessionExpiryHandler />}
        <BCGovTypography />
        {component}
      </RelayEnvironmentProvider>
    </Sentry.ErrorBoundary>
  );
}

export default MyApp;
