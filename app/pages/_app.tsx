import { AppProps } from "next/app";
import { RelayEnvironmentProvider } from "react-relay/hooks";
import { getInitialPreloadedQuery, getRelayProps } from "relay-nextjs/app";
import { getClientEnvironment } from "../lib/relay/client";
import BCGovTypography from "components/BCGovTypography";
import SessionExpiryHandler from "components/Session/SessionExpiryHandler";
import { Suspense, useEffect, useMemo, useState } from "react";
import * as Sentry from "@sentry/react";

import { ErrorContext } from "contexts/ErrorContext";
import "normalize.css";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import LoadingFallback from "components/Layout/LoadingFallback";
import Custom500 from "./500";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";
import getConfig from "next/config";
config.autoAddCss = false;

const clientEnv = getClientEnvironment();
const initialPreloadedQuery = getInitialPreloadedQuery({
  createClientEnvironment: () => getClientEnvironment()!,
});
const { publicRuntimeConfig } = getConfig();

const growthbook = new GrowthBook();

function MyApp({ Component, pageProps }: AppProps) {
  const [error, setError] = useState(null);
  const [hasMounted, setHasMounted] = useState(false);
  const value = { error, setError };
  useEffect(() => {
    setError(null);
  }, [Component]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  /* Running the fetch to the growthbook API inside a useMemo cuts down on the amount of fetches done,
  however it does mean that any on/off toggling done in the Growthbook dashboard while a user is using the app
  will not take effect the page is refreshed. We decided this fit our use case, since we're unlikely to be
  toggling things on/off outside of releases to production.
  */
  useMemo(() => {
    const fetchGrowthbook = async () => {
      try {
        const data = await fetch(
          `https://cdn.growthbook.io/api/features/${publicRuntimeConfig.GROWTHBOOK_API_KEY}`
        )
          .then((res) => res.json())
          .then((res) => {
            growthbook.setFeatures(res.features);
          });
        return data;
      } catch (e) {
        console.error(e);
      }
    };
    fetchGrowthbook();
  }, []);

  const relayProps = getRelayProps(pageProps, initialPreloadedQuery);
  const env = relayProps.preloadedQuery?.environment ?? clientEnv!;

  const component = hasMounted ? (
    <Component {...pageProps} {...relayProps} />
  ) : (
    <Suspense fallback={<LoadingFallback />}>
      <Component {...pageProps} {...relayProps} />
    </Suspense>
  );

  return (
    <GrowthBookProvider growthbook={growthbook}>
      <ErrorContext.Provider value={value}>
        <BCGovTypography />
        <Sentry.ErrorBoundary fallback={<Custom500 />}>
          <RelayEnvironmentProvider environment={env}>
            {hasMounted && <SessionExpiryHandler />}
            {component}
          </RelayEnvironmentProvider>
        </Sentry.ErrorBoundary>
      </ErrorContext.Provider>
    </GrowthBookProvider>
  );
}

export default MyApp;
