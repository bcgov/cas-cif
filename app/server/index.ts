import delay from "delay";
import express from "express";
import http from "http";
import morgan from "morgan";
import nextjs from "next";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import lusca from "lusca";
import { createLightship } from "lightship";
import session from "./middleware/session";
import browserSupportMiddleware from "./middleware/browserSupport";
import headersMiddleware from "./middleware/headers";
import graphQlMiddleware from "./middleware/graphql";
import { pgPool } from "./db";
import ssoMiddleware from "./middleware/sso";
// graphql-upload exports the `.js` in the path: https://github.com/jaydenseric/graphql-upload/blob/aa15ee0eb2b3a4e2421d098393bbbf9252f1a8c7/package.json#L41
// eslint-disable-next-line import/extensions
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.js";
import config from "../config";
import attachmentDownloadRouter from "./middleware/attachmentDownloadRouter";
import { attachmentDeleteRouter } from "/home/briannacerkiewicz/cas-cif/app/server/middleware/attachmentDeleteRouter";

const port = config.get("port");
const dev = config.get("env") !== "production";
const app = nextjs({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();

  // trust the first proxy, so that secure cookies are set,
  // even though the request reaching the express container is not secure
  server.set("trust proxy", 1);

  const lightship = await createLightship();

  lightship.registerShutdownHandler(async () => {
    // Allow the server to send any in-flight requests before shutting down
    await delay(10000);
    await app.close();
    await pgPool.end();
  });

  server.use(headersMiddleware());

  server.use(morgan("combined"));

  server.use(bodyParser.json({ limit: "50mb" }));

  server.use("/", browserSupportMiddleware());

  const { middleware: sessionMiddleware } = session();
  server.use(sessionMiddleware);

  server.use(await ssoMiddleware());

  server.use(cookieParser());

  server.use(graphQlMiddleware());

  server.use(lusca.csrf());
  server.use(graphqlUploadExpress());
  server.use(attachmentDownloadRouter);

  server.use(attachmentDeleteRouter);

  server.get("*", async (req, res) => {
    return handle(req, res);
  });

  http
    .createServer(server)
    .listen(port, () => {
      lightship.signalReady();
      console.log(`> Ready on http://localhost:${port}`);
    })
    .on("error", (err) => {
      console.error(err);
      lightship.shutdown();
    });
});
