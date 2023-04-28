const { RemoteBrowserTarget } = require("happo.io");
const config = require("./config");
const laptopViewport = "1366x768";
const halfScreenViewport = "600x768";

module.exports = {
  project: "cas-cif",
  apiKey: config.get("happoApiKey"),
  apiSecret: config.get("happoApiSecret"),
  targets: {
    "chrome-laptop": new RemoteBrowserTarget("chrome", {
      viewport: laptopViewport,
    }),
    "chrome-laptop-half-screen": new RemoteBrowserTarget("chrome", {
      viewport: halfScreenViewport,
    }),
    "firefox-laptop": new RemoteBrowserTarget("firefox", {
      viewport: laptopViewport,
    }),
    "firefox-laptop-half-screen": new RemoteBrowserTarget("firefox", {
      viewport: halfScreenViewport,
    }),
    "edge-laptop": new RemoteBrowserTarget("edge", {
      viewport: laptopViewport,
    }),
    "edge-laptop-half-screen": new RemoteBrowserTarget("edge", {
      viewport: halfScreenViewport,
    }),
  },
};
