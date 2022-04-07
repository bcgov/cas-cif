import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pgPool } from "../db";
import config from "../../config";

const PgSession = connectPgSimple(expressSession);
// True if the host has been configured to use https
const secure = /^https/.test(config.get("host"));

// Ensure we properly crypt our cookie session store with a pre-shared key in a secure environment
if (secure && typeof config.get("sessionSecret") !== typeof String())
  throw new Error("export SESSION_SECRET to encrypt session cookies");
if (secure && config.get("sessionSecret").length < 24)
  throw new Error("exported SESSION_SECRET must be at least 24 characters");
if (!config.get("sessionSecret"))
  console.warn("SESSION_SECRET missing from environment");
const secret = config.get("sessionSecret");

const session = () => {
  const store = new PgSession({
    pool: pgPool,
    schemaName: "cif_private",
    tableName: "connect_session",
  });

  const middleware = expressSession({
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure },
    store,
  });

  return { middleware, store };
};

export default session;
