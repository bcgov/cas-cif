/*
 * Any custom formats defined here must also be defined in app/server/middleware/graphql/validateRecord.ts to make AJV aware of them.
 * Example: ajv.addFormat('<format_name>', <regex>);
 */

export const customFormats = {
  rfpDigits: /\d{3,4}/,
  email: /^[\.\w-]+@([\w-]+\.)+[\w-]{2,4}$/,
  phone: /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
};

export const customFormatsErrorMessages = {
  rfpDigits: "Please enter 3 or 4 digits for the random RFP digits",
  email: "Please enter in the format: name@example.com",
  phone: "Please enter in a valid phone number format (e.g. 1 234 567 8909)",
};
