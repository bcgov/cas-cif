const path = require("path");
const Dotenv = require("dotenv-webpack");
const { withSentryConfig } = require("@sentry/nextjs");
const config = require("./config");

const nextConfig = {
  cssModules: true,
  webpack: (inputConfig) => {
    inputConfig.resolve.fallback = {
      ...inputConfig.resolve.fallback,
      fs: false,
    };
    const configWithPlugins = { ...inputConfig };
    configWithPlugins.plugins = inputConfig.plugins || [];

    configWithPlugins.plugins = [
      ...configWithPlugins.plugins,
      // Read the .env file
      new Dotenv({
        path: path.join(__dirname, ".env"),
        systemvars: true,
      }),
    ];

    return configWithPlugins;
  },
  serverRuntimeConfig: {
    PORT: config.get("port"),
  },
  publicRuntimeConfig: {
    SITEWIDE_NOTICE: config.get("sitewideNotice"),
    ENABLE_MOCK_TIME: config.get("enableMockTime"),
    SUPPORT_EMAIL: config.get("supportEmail"),
    SENTRY_ENVIRONMENT: config.get("sentryEnvironment"),
    SENTRY_RELEASE: config.get("sentryRelease"),
  },
};

const sentryWebpackPluginOptions = {
  // Set to false to create a sentry release on build with the sentry CLI
  // This will upload sourcemaps to sentry.
  dryRun: true,
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
