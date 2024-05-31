// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";
import getConfig from "next/config";

const { SENTRY_ENVIRONMENT, SENTRY_RELEASE } =
  getConfig().publicRuntimeConfig || {};

const SENTRY_DSN = SENTRY_ENVIRONMENT
  ? "https://f27892e53f5446dd87ca7eaebf3d920d@o646776.ingest.sentry.io/6251728"
  : null;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENVIRONMENT,
  release: SENTRY_RELEASE,
  tracesSampleRate: 1.0,
});
