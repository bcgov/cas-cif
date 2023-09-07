import expressSession from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pgPool } from "../db";
import config from "../../config";

const PgSession = connectPgSimple(expressSession);
// True if the host has been configured to use https
const secure = /^https/.test(config.get("host"));
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
