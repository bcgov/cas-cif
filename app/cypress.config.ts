// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  screenshotOnRunFailure: false,
  defaultCommandTimeout: 10000,
  retries: {
    runMode: 0,
    openMode: 0,
  },
  fixturesFolder: "../schema/data",
  viewportWidth: 1366,
  viewportHeight: 768,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // eslint-disable-next-line import/extensions
      return require("./cypress/plugins/index.js")(on, config);
    },
    baseUrl: "http://localhost:3004",
    excludeSpecPattern: "*.example*",
    experimentalRunAllSpecs: true,
  },
});
