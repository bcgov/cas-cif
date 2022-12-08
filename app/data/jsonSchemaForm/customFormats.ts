import { KEY_EMAIL, KEY_PHONE_NO, KEY_RFP_DIGITS, REGEX_EMAIL, REGEX_PHONE_NO, REGEX_RFP_DIGITS } from "data/validation-constants";

/*
 * Any custom formats defined here must also be defined in app/server/middleware/graphql/validateRecord.ts to make AJV aware of them.
 * Example: ajv.addFormat('<format_name>', <regex>);
 */

export const customFormats = {
  [KEY_RFP_DIGITS]: REGEX_RFP_DIGITS,
  [KEY_EMAIL]: REGEX_EMAIL,
  [KEY_PHONE_NO]: REGEX_PHONE_NO,
};

export const customFormatsErrorMessages = {
  KEY_RFP_DIGITS: "Please enter 3 or 4 digits for the random RFP digits",
  KEY_EMAIL: "Please enter in the format: name@example.com",
  KEY_PHONE_NO: "Please enter in a valid phone number format (e.g. 123 456 7890)",
};
