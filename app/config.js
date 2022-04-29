const convict = require("convict");
const convictFormatWithValidator = require("convict-format-with-validator");
const crypto = require("crypto");
const dotenv = require("dotenv");

// load values from .env
dotenv.config();

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
    format: ["development", "test", "production"],
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
        throw new Error(`Namespace must end with "-dev", "-test", or "-prod".`);
      }
    },
    default: "",
    env: "NAMESPACE",
  },
  sessionSecret: {
    doc: "Secret used to encrypt session cookies.",
    format: function check(val) {
      if (typeof val !== typeof String())
        throw new Error("sessionSecret must be of type string.");
      if (val.length < 24)
        throw new Error("sessionSecret must be at least 24 characters");
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
    default: "",
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
    doc: "An html notice to print at the top of the page, e.g. to identify dev/test versions of the app.",
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
  gcsCredentials: {
    doc: "Google Cloud Storage credentials.",
    default: "/credentials/credentials.json",
    env: "GOOGLE_APPLICATION_CREDENTIALS",
  },
  attachmentsBucket: {
    doc: "Bucket name for attachments.",
    default: "attachments",
    env: "ATTACHMENTS_BUCKET",
  },
  enableMockAuth: {
    doc: "",
    default: null,
    format: "Boolean",
    nullable: true,
    env: "ENABLE_MOCK_AUTH",
  },
  mockAuthCookie: {
    default: "mocks.auth",
    format: String,
    env: "MOCK_AUTH_COOKIE",
  },
  showKCLogin: {
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

if (config.get("namespace") && !process.env.SESSION_SECRET) {
  throw new Error("Must set 'SESSION_SECRET' when 'NAMESPACE' is set.");
}

config.validate({ allowed: "strict" });

module.exports = config;
