import convict from "convict";
import convictFormatWithValidator from "convict-format-with-validator";
import crypto from "crypto";
import dotenv from "dotenv";

// load values from .env
dotenv.config();
/**
 * TODO:
 * - replace .env with json files?
 * - handle conditionals
 * - next.config.js use of dotenv-webpack
 * - handle --as-role
 * - clear out /args.ts
 * - decide on whether conditional fails error or are overwritten accordingly (if possible)
 */
convict.addFormats(convictFormatWithValidator);
convict.addFormat({
  name: "host",
  validate: function (val) {
    if (
      !/(?:^)((https?:\/\/)?(?:localhost|[\w-]+(?:\.[\w-]+)+)(:\d+)?(\/\S*)?)/gm.test(
        val
      )
    ) {
      throw new Error("Must be a valid hostname.");
    }
  },
});

var config = convict({
  env: {
    doc: "Node environment.",
    format: ["development", "production"],
    default: "development",
    env: "NODE_ENV",
  },
  host: {
    doc: "Host for the app.",
    format: "host",
    default: "http://localhost:3004",
    env: "HOST",
  },
  port: {
    doc: "The port to bind app to.",
    format: "port",
    default: 3004,
    env: "PORT",
  },
  namespace: {
    doc: "Openshift namespace.",
    format: function check(val) {
      if (val && typeof val !== "string") {
        throw new Error("Namespace must be a string or null.");
      }
      if (
        val &&
        !val.endsWith("-dev") &&
        !val.endsWith("-test") &&
        !val.endsWith("-prod")
      ) {
        throw new Error(
          `Invalid namespace: ${val}. Must end with "-dev", "-test", or "-prod".`
        );
      }
    },
    default: "",
    env: "NAMESPACE",
  },
  sessionSecret: {
    doc: "Secret used for cookie sessions.",
    format: function check(val) {
      if (val.length < 24) {
        throw new Error(
          `Invalid sessionSecret: ${val}. Must be at least 24 characaters. length: ${val.length}`
        );
      }
    },
    default: crypto.randomBytes(36).toString(),
    nullable: false,
    sensitive: true,
    env: "SESSION_SECRET",
  },
  pgUser: {
    doc: "Username for the PG database.",
    format: String,
    default: "cif_app",
    nullable: false,
    env: "PGUSER",
  },
  pgPassword: {
    doc: "Password for the PG database.",
    format: "*",
    env: "PGPASSWORD",
    sensitive: true,
  },
  pgPort: {
    doc: "Port that PG instance is hosted at.",
    format: "port",
    default: 5432,
    env: "PGPORT",
  },
  pgHost: {
    doc: "Host of the PG instance.",
    format: "host",
    default: "localhost",
    env: "PGHOST",
  },
  pgDatabase: {
    doc: "Name of the database in PG.",
    format: String,
    default: "cif",
    nullable: false,
    env: "PGDATABASE",
  },
  databaseSchema: {
    doc: "Name of the schema in PG.",
    format: String,
    default: "cif",
    nullable: false,
    env: "DATABASE_SCHEMA",
  },
  sitewideNotice: {
    doc: "Sitewide banner notice.",
    format: String,
    nullable: true,
    default: null,
    env: "SITEWIDE_NOTICE",
  },
  supportEmail: {
    doc: "Support email address provided.",
    format: "email",
    default: "ggircs@gov.bc.ca",
    env: "SUPPORT_EMAIL",
  },
  sentryEnvironment: {
    doc: "",
    format: String,
    default: "localhost",
    env: "SENTRY_ENVIRONMENT",
  },
  sentryRelease: {
    doc: "",
    format: String,
    default: "local_development",
    env: "SENTRY_RELEASE",
  },
  // renamed from ENABLE_DB_MOCKS
  enableMockTime: {
    doc: "Show a calendar on screen to allow time travel in -dev and -test environments.",
    format: "Boolean",
    default: false,
    env: "ENABLE_MOCK_TIME",
  },
  enableDbMocksCookiesOnly: {
    doc: "Allows a cookie to be set to mock the time (no calendar).",
    format: "Boolean",
    default: false,
    env: "ENABLE_DB_MOCKS_COOKIES_ONLY",
  },
  storageApiHost: {
    doc: "Host of storage API.",
    format: "host",
    default: "http://localhost:8000",
    env: "STORAGE_API_HOST",
  },
  storageApiKey: {
    // Not yet used in deployments, so no validation function yet.
    doc: "API key for storage.",
    default: null,
    env: "STORAGE_API_KEY",
  },
  enableMockAuth: {
    doc: "",
    default: null,
    format: "Boolean",
    nullable: true,
    env: "ENABLE_MOCK_AUTH",
  },
  showKcLogin: {
    doc: "Show the keycloak login page.",
    default: false,
    format: "Boolean",
    env: "SHOW_KC_LOGIN",
  },
  cifRole: {
    doc: "Login as a specific role.",
    nullable: true,
    default: null,
    format: ["CIF_INTERNAL", "CIF_EXTERNAL", "CIF_ADMIN", "UNAUTHORIZED_IDIR"],
    arg: "as-role",
  },
  happoApiKey: {
    default: null,
    format: "*",
    env: "HAPPO_API_KEY",
  },
  happoApiSecret: {
    default: null,
    format: "*",
    env: "HAPPO_API_SECRET",
  },
});

// In case default host is used with non-default port
if (
  config.get("host") === "http://localhost:3004" &&
  config.get("port") !== 3004
) {
  config.load({ host: `http://localhost:${config.get("port")}` });
}

if (config.get("namespace").endsWith("-prod") && config.get("enableMockTime")) {
  throw new Error("ENABLE_MOCK_TIME cannot be true with a -prod namespace.");
}

if (config.get("namespace") && config.get("enableMockAuth")) {
  throw new Error("ENABLE_MOCK_AUTH cannot be true when NAMESPACE is set.");
}

if (config.get("namespace") && config.get("cifRole")) {
  throw new Error("Cannot set both namespace and cifRole.");
}

config.validate({ allowed: "strict" });

export const MOCK_AUTH_COOKIE = "mocks.auth";

export default config;
// For use in .js files
module.exports = config;
