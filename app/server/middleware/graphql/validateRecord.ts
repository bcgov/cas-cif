import Ajv, { ErrorObject } from "ajv";
import { KEY_EMAIL, KEY_PHONE_NO, KEY_RFP_DIGITS, REGEX_EMAIL, REGEX_PHONE_NO, REGEX_RFP_DIGITS } from "data/validation-constants";

const ajv = new Ajv({ allErrors: true });
// AJV needs to be made aware of any custom formats used in the schema
ajv.addFormat(KEY_RFP_DIGITS, REGEX_RFP_DIGITS);
ajv.addFormat(KEY_EMAIL, REGEX_EMAIL);
ajv.addFormat(KEY_PHONE_NO, REGEX_PHONE_NO);

const validateRecord: (schema: any, formData: any) => ErrorObject[] = (
  schema,
  formData
) => {
  // ajv caches compiled schemas on first instantiation, we don't need to
  // precompile schemas in advance
  const validate = ajv.compile(schema);
  const valid = validate(formData);

  return valid ? [] : validate.errors;
};

export default validateRecord;
