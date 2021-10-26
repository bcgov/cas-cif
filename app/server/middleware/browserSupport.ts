import type { Request } from "express";
import Bowser from "bowser";
const UNSUPPORTED_BROWSERS = {
  ie: "<=11",
  safari: "<11",
  firefox: "<61",
  samsung_internet: "<10",
  chrome: "<68",
};

// Renders a static info page on unsupported browsers.
// Files in /public/ are excluded.
const checkBrowser = () => {
  return (req: Request, res, next) => {
    const { path } = req;
    if (
      path.startsWith("/icons/") ||
      path.startsWith("/img/") ||
      path.startsWith("/update-browser.html")
    ) {
      next();
      return;
    }

    const browser = Bowser.getParser(req.get("User-Agent"));
    const isUnsupported = browser.satisfies(UNSUPPORTED_BROWSERS);
    if (isUnsupported) res.redirect("/update-browser.html");
    else next();
  };
};

export default checkBrowser;
