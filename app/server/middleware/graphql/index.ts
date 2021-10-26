import type { Request } from "express";
import { postgraphile } from "postgraphile";
import { pgPool } from "../../db";
import { makePluginHook, PostGraphileOptions } from "postgraphile";
import PgManyToManyPlugin from "@graphile-contrib/pg-many-to-many";
import PostgraphileLogConsola from "postgraphile-log-consola";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import authenticationPgSettings from "./authenticationPgSettings";
import { generateDatabaseMockOptions } from "../../helpers/databaseMockPgOptions";

// Use consola for logging instead of default logger
const pluginHook = makePluginHook([PostgraphileLogConsola]);

let postgraphileOptions: PostGraphileOptions = {
  pluginHook,
  appendPlugins: [PgManyToManyPlugin, ConnectionFilterPlugin],
  classicIds: true,
  enableQueryBatching: true,
  dynamicJson: true,
  extendedErrors: ["hint", "detail", "errcode"],
  showErrorStack: "json",
};

if (process.env.NODE_ENV === "production") {
  postgraphileOptions = {
    ...postgraphileOptions,
    retryOnInitFail: true,
  };
} else {
  postgraphileOptions = {
    ...postgraphileOptions,
    graphiql: true,
    enhanceGraphiql: true,
    allowExplain: true,
  };
}

const postgraphileMiddleware = () => {
  return postgraphile(
    pgPool,
    process.env.DATABASE_SCHEMA || "cif",
    {
      ...postgraphileOptions,
      graphileBuildOptions: {
        connectionFilterAllowNullInput: true,
        connectionFilterRelations: true,
      },
      pgSettings: (req: Request) => {
        const opts = {
          ...authenticationPgSettings(req),
          ...generateDatabaseMockOptions(req.cookies, [
            "mocks.mocked_timestamp",
          ]),
        };
        return opts;
      },
    }
  );
};

export default postgraphileMiddleware;
