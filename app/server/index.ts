import delay from "delay";
import express from "express";
import http from "http";
import morgan from "morgan";
import nextjs from "next";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { createLightship } from "lightship";
import session from "./middleware/session";
import browserSupportMiddleware from "./middleware/browserSupport";
import headersMiddleware from "./middleware/headers";
import graphQlMiddleware from "./middleware/graphql";
import { pgPool } from "./db";
import ssoMiddleware from "./middleware/sso";

const port = Number.parseInt(process.env.PORT, 10) || 3004;
const dev = process.env.NODE_ENV !== "production";
const app = nextjs({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  const server = express();

  // nginx proxy is running in the same pod
  server.set("trust proxy", "loopback");

  const lightship = createLightship();

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

  server.get("/auth-callback", async (req) => {
    const createUserMutation = `
      mutation {
        createUserFromSession(input: {}) {
          __typename
        }
      }
    `;

    const fetchOptions = {
      method: "POST",
      body: JSON.stringify({
        query: createUserMutation,
        variables: null,
      }),
      headers: {
        "Content-Type": "application/json",
        cookie: req.headers.cookie,
      },
    };

    const response = await fetch(
      `http://localhost:${port}/graphql`,
      fetchOptions
    );
  });

  server.use(cookieParser());

  server.use(graphQlMiddleware());

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
