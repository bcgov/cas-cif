import helmet from "helmet";
import config from "../../config";

const headersMiddleware = () => {
  const helmetMiddleware = helmet({
    contentSecurityPolicy: false,
  });
  return (req, res, next) => {
    // Tell search + crawlers not to index non-production environments:
    if (
      !config.get("namespace") ||
      !config.get("namespace").endsWith("-prod")
    ) {
      res.append("X-Robots-Tag", "noindex, noimageindex, nofollow, noarchive");
    }
    helmetMiddleware(req, res, next);
  };
};

export default headersMiddleware;
