export const AS_CIF_INTERNAL = process.argv.includes("AS_CIF_INTERNAL");
export const AS_CIF_EXTERNAL = process.argv.includes("AS_CIF_EXTERNAL");
export const AS_CIF_ADMIN = process.argv.includes("AS_CIF_ADMIN");
export const AS_UNAUTHORIZED_IDIR = process.argv.includes(
  "AS_UNAUTHORIZED_IDIR"
);
export const ENABLE_MOCK_AUTH = process.argv.includes("ENABLE_MOCK_AUTH");
export const MOCK_AUTH_COOKIE = "mocks.auth";
