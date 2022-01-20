import type { Request } from "express";
import { postgraphile } from "postgraphile";
import { pgPool } from "../../db";
import { makePluginHook, PostGraphileOptions } from "postgraphile";
import PgManyToManyPlugin from "@graphile-contrib/pg-many-to-many";
import PostgraphileLogConsola from "postgraphile-log-consola";
import ConnectionFilterPlugin from "postgraphile-plugin-connection-filter";
import { TagsFilePlugin } from "postgraphile/plugins";
import PostGraphileUploadFieldPlugin from "postgraphile-plugin-upload-field";
import PgOmitArchived from "@graphile-contrib/pg-omit-archived";
import PgOrderByRelatedPlugin from "@graphile-contrib/pg-order-by-related";
import authenticationPgSettings from "./authenticationPgSettings";
import { generateDatabaseMockOptions } from "../../helpers/databaseMockPgOptions";

// Use consola for logging instead of default logger
const pluginHook = makePluginHook([PostgraphileLogConsola]);

let postgraphileOptions: PostGraphileOptions = {
  pluginHook,
  appendPlugins: [
    PgManyToManyPlugin,
    ConnectionFilterPlugin,
    TagsFilePlugin,
    PostGraphileUploadFieldPlugin,
    PgOmitArchived,
    PgOrderByRelatedPlugin,
  ],
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

async function saveRemoteFile({ stream }) {
  const response = await fetch(
    `${process.env.STORAGE_API_HOST}/api/v1/attachments/upload`,
    {
      method: "POST",
      headers: {
        "api-key": process.env.STORAGE_API_KEY,
        "Content-Type": "multipart/form-data",
      },
      body: stream,
    }
  );
  try {
    return await response.json();
  } catch (e) {
    console.error(e);
  }
}

async function resolveUpload(upload) {
  const { createReadStream } = upload;
  const stream = createReadStream();

  // Save tile to remote storage system
  const { uuid } = await saveRemoteFile({ stream });

  return uuid;
}

const postgraphileMiddleware = () => {
  return postgraphile(pgPool, process.env.DATABASE_SCHEMA || "cif", {
    ...postgraphileOptions,
    graphileBuildOptions: {
      connectionFilterAllowNullInput: true,
      connectionFilterAllowEmptyObjectInput: true,
      connectionFilterRelations: true,
      uploadFieldDefinitions: [
        {
          match: ({ table, column }) =>
            table === "attachment" && column === "file",
          resolve: resolveUpload,
        },
      ],
      pgArchivedColumnName: "deleted_at",
      pgArchivedColumnImpliesVisible: false,
      pgArchivedRelations: false,
    },
    pgSettings: (req: Request) => {
      const opts = {
        ...authenticationPgSettings(req),
        ...generateDatabaseMockOptions(req.cookies, ["mocks.mocked_timestamp"]),
      };
      return opts;
    },
  });
};

export default postgraphileMiddleware;
