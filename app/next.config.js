const path = require("path");
const Dotenv = require("dotenv-webpack");
const dotenv = require("dotenv");

dotenv.config();

module.exports = {
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
    PORT: process.env.PORT,
  },
  publicRuntimeConfig: {
    SITEWIDE_NOTICE: process.env.SITEWIDE_NOTICE,
    ENABLE_DB_MOCKS: process.env.ENABLE_DB_MOCKS,
  },
};
