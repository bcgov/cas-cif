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
    "ios-safari": new RemoteBrowserTarget("ios-safari", {
      viewport: "375x667",
      scrollStitch: true,
    }),
    "ipad-safari": new RemoteBrowserTarget("ipad-safari", {
      viewport: "1080x810",
      scrollStitch: true,
    }),
  },
};
