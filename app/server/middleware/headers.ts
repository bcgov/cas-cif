import helmet from "helmet";

const headersMiddleware = () => {
  const helmetMiddleware = helmet({
    contentSecurityPolicy: process.env.NODE_ENV === "production",
  });
  return (req, res, next) => {
    // Tell search + crawlers not to index non-production environments:
    if (!process.env.NAMESPACE || !process.env.NAMESPACE.endsWith("-prod")) {
      res.append("X-Robots-Tag", "noindex, noimageindex, nofollow, noarchive");
    }
    helmetMiddleware(req, res, next);
  };
};

export default headersMiddleware;
