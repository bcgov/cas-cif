const { RemoteBrowserTarget } = require("happo.io");
const config = require("./config");
const laptopViewport = "1366x768";

module.exports = {
  project: "cas-cif",
  apiKey: config.get("happoApiKey"),
  apiSecret: config.get("happoApiSecret"),
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
