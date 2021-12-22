const { RemoteBrowserTarget } = require("happo.io");

module.exports = {
  project: "cas-cif",
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  targets: {
    chrome: new RemoteBrowserTarget("chrome", {
      viewport: "1366×768",
    }),
    firefox: new RemoteBrowserTarget("firefox", {
      viewport: "1366×768",
    }),
    edge: new RemoteBrowserTarget("edge", {
      viewport: "1366×768",
    }),
    safari: new RemoteBrowserTarget("safari", {
      viewport: "1366×768",
      scrollStitch: true,
    }),
  },
};
