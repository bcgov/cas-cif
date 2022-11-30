import Ajv, { ErrorObject } from "ajv";

const ajv = new Ajv({ allErrors: true });
// AJV needs to be made aware of any custom formats used in the schema
ajv.addFormat("rfpDigits", /\d{3,4}/);
ajv.addFormat("email", /^[\.\w-]+@([\w-]+\.)+[\w-]{2,4}$/);
ajv.addFormat(
  "phone",
  /^(\+?\d{1,2}[\s,-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
);

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
