const { RemoteBrowserTarget } = require("happo.io");

const laptopViewport = "1366x768";

module.exports = {
  project: "cas-cif",
  apiKey: process.env.HAPPO_API_KEY,
  apiSecret: process.env.HAPPO_API_SECRET,
  targets: {
    chrome: new RemoteBrowserTarget("chrome", {
      viewport: laptopViewport,
    }),
    firefox: new RemoteBrowserTarget("firefox", {
      viewport: laptopViewport,
    }),
    edge: new RemoteBrowserTarget("edge", {
      viewport: laptopViewport,
    }),
    safari: new RemoteBrowserTarget("safari", {
      viewport: laptopViewport,
      scrollStitch: true,
    }),
  },
};
