/*
  Database connection service that creates a pgPool connection
  based on database options in the environment variables of calling process.
*/

import pg from "pg";
import config from "../../config";

export const getDatabaseUrl = () => {
  // If authentication is disabled use the user above to connect to the database
  // Otherwise, use the PGUSER env variable
  const PGUSER = config.get("pgUser") || "postgres";

  let databaseURL = "postgres://";

  databaseURL += PGUSER;

  if (config.get("pgPassword")) {
    databaseURL += `:${encodeURIComponent(config.get("pgPassword").toString())}`;
  }

  databaseURL += "@";

  databaseURL += config.get("pgHost");
  if (config.get("pgPort")) {
    databaseURL += `:${config.get("pgPort")}`;
  }

  databaseURL += "/";
  databaseURL += config.get("pgDatabase");

  return databaseURL;
};

export const pgPool = new pg.Pool({ connectionString: getDatabaseUrl() });
