const { withSentryConfig } = require("@sentry/nextjs");
const config = require("./config");

const nextConfig = {
  webpack: (inputConfig) => {
    inputConfig.resolve.fallback = {
      ...inputConfig.resolve.fallback,
      fs: false,
    };
    const configWithPlugins = { ...inputConfig };
    configWithPlugins.plugins = inputConfig.plugins || [];

    return configWithPlugins;
  },
  serverRuntimeConfig: {
    PORT: config.get("port"),
  },
  publicRuntimeConfig: {
    SITEWIDE_NOTICE: config.get("sitewideNotice"),
    ENABLE_MOCK_TIME: config.get("enableMockTime"),
    SUPPORT_EMAIL: config.get("supportEmail"),
    PROGRAM_DIRECTOR_NAME: config.get("directorName"),
    PROGRAM_DIRECTOR_EMAIL: config.get("directorEmail"),
    SENTRY_ENVIRONMENT: config.get("sentryEnvironment"),
    SENTRY_RELEASE: config.get("sentryRelease"),
    GROWTHBOOK_API_KEY: config.get("growthbookApiKey"),
    BYPASS_GROWTHBOOK: config.get("bypassGrowthbook"),
    SESSION_SECRET: config.get("sessionSecret"),
  },
};

const sentryWebpackPluginOptions = {
  // Set to false to create a sentry release on build with the sentry CLI
  // This will upload sourcemaps to sentry.
  dryRun: true,
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
