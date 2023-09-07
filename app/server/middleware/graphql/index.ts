import type { Request } from "express";
import {
  postgraphile,
  createPostGraphileSchema,
  withPostGraphileContext,
} from "postgraphile";
import { pgPool, getDatabaseUrl } from "../../db";
import { makePluginHook, PostGraphileOptions } from "postgraphile";
import PostgraphileRc from "../../../.postgraphilerc";
import PgManyToManyPlugin from "@graphile-contrib/pg-many-to-many";
import PostgraphileLogConsola from "postgraphile-log-consola";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import { TagsFilePlugin } from "postgraphile/plugins";
import PostGraphileUploadFieldPlugin from "./uploadFieldPlugin";
import PgOmitArchived from "@graphile-contrib/pg-omit-archived";
import PgOrderByRelatedPlugin from "@graphile-contrib/pg-order-by-related";
import authenticationPgSettings from "./authenticationPgSettings";
import { generateDatabaseMockOptions } from "../../helpers/databaseMockPgOptions";
import FormChangeValidationPlugin from "./formChangeValidationPlugin";
import CreateFormChangeValidationPlugin from "./createFormChangeValidationPlugin";
import { graphql, GraphQLSchema } from "graphql";
import * as Sentry from "@sentry/nextjs";
import config from "../../../config";
import resolveFileUpload from "./resolveFileUpload";

// Use consola for logging instead of default logger
const pluginHook = makePluginHook([PostgraphileLogConsola]);

export const pgSettings = (req: Request) => {
  const opts = {
    ...authenticationPgSettings(req),
    ...generateDatabaseMockOptions(req.cookies, ["mocks.mocked_timestamp"]),
  };
  return opts;
};

let postgraphileOptions: PostGraphileOptions = {
  pluginHook,
  appendPlugins: [
    PgManyToManyPlugin,
    ConnectionFilterPlugin,
    TagsFilePlugin,
    PostGraphileUploadFieldPlugin,
    PgOmitArchived,
    PgOrderByRelatedPlugin,
    FormChangeValidationPlugin,
    CreateFormChangeValidationPlugin,
  ],
  classicIds: true,
  enableQueryBatching: true,
  dynamicJson: true,
  graphileBuildOptions: {
    ...PostgraphileRc.options.graphileBuildOptions,
    uploadFieldDefinitions: [
      {
        match: ({ table, column }) =>
          table === "attachment" && column === "file",
        resolve: resolveFileUpload,
      },
    ],
  },
  pgSettings,
};

if (config.get("sentryEnvironment")) {
  postgraphileOptions = {
    ...postgraphileOptions,
    handleErrors: (errors) => {
      Sentry.captureException(errors);
      return errors;
    },
  };
} else {
  postgraphileOptions = {
    ...postgraphileOptions,
    extendedErrors: ["hint", "detail", "errcode"],
    showErrorStack: "json",
  };
}

if (config.get("env") === "production") {
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
    config.get("databaseSchema"),
    postgraphileOptions
  );
};

export default postgraphileMiddleware;

let postgraphileSchemaSingleton: GraphQLSchema;

const postgraphileSchema = async () => {
  if (!postgraphileSchemaSingleton) {
    postgraphileSchemaSingleton = await createPostGraphileSchema(
      getDatabaseUrl(),
      config.get("databaseSchema"),
      postgraphileOptions
    );
  }

  return postgraphileSchemaSingleton;
};

export async function performQuery(query, variables, request: Request) {
  const settings = pgSettings(request);
  return withPostGraphileContext(
    {
      pgPool,
      pgSettings: settings,
    },
    async (context) => {
      // Execute your GraphQL query in this function with the provided
      // `context` object, which should NOT be used outside of this
      // function.
      return graphql(
        await postgraphileSchema(),
        query,
        null,
        { ...context }, // You can add more to context if you like
        variables
      );
    }
  );
}
