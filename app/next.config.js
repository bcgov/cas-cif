const path = require("path");
const Dotenv = require("dotenv-webpack");
const dotenv = require("dotenv");
const { withSentryConfig } = require("@sentry/nextjs");

dotenv.config();

const nextConfig = {
  cssModules: true,
  webpack: (config) => {
    const configWithPlugins = { ...config };
    configWithPlugins.plugins = config.plugins || [];

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
    PORT: process.env.PORT || "3004",
  },
  publicRuntimeConfig: {
    SITEWIDE_NOTICE: process.env.SITEWIDE_NOTICE,
    ENABLE_DB_MOCKS: process.env.ENABLE_DB_MOCKS,
    SUPPORT_EMAIL: process.env.SUPPORT_EMAIL,
  },
};

const sentryWebpackPluginOptions = {
  // Set to false to create a sentry release on build with the sentry CLI
  // This will upload sourcemaps to sentry.
  dryRun: true,
  silent: true,
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
