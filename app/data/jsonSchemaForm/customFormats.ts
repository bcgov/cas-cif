/*
 * Any custom formats defined here must also be defined in app/server/middleware/graphql/validateRecord.ts to make AJV aware of them.
 * Example: ajv.addFormat('<format_name>', <regex>);
 */

export const customFormats = {
  rfpDigits: /\d{3,4}/,
};

export const customFormatsErrorMessages = {
  rfpDigits: "Please enter 3 or 4 digits for the random RFP digits",
};
