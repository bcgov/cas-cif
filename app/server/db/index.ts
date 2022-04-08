/*
  Database connection service that creates a pgPool connection
  based on database options in the environment variables of calling process.
*/

import pg from "pg";

export const getDatabaseUrl = () => {
  // If authentication is disabled use the user above to connect to the database
  // Otherwise, use the PGUSER env variable
  const PGUSER = process.env.PGUSER || "postgres";

  let databaseURL = "postgres://";

  databaseURL += PGUSER;
  if (process.env.PGPASSWORD) {
    databaseURL += `:${encodeURIComponent(process.env.PGPASSWORD)}`;
  }

  databaseURL += "@";

  databaseURL += process.env.PGHOST || "localhost";
  if (process.env.PGPORT) {
    databaseURL += `:${process.env.PGPORT}`;
  }

  databaseURL += "/";
  databaseURL += process.env.PGDATABASE || "cif";

  return databaseURL;
};

export const pgPool = new pg.Pool({ connectionString: getDatabaseUrl() });
