import Ajv, { ErrorObject } from "ajv";
import validationSchemas from "../../../data/jsonSchemaForm/validationSchemas";

const ajv = new Ajv({ allErrors: true });
// AJV needs to be made aware of any custom formats used in the schema
ajv.addFormat("rfpDigits", /\d{3,4}/);

const validateRecord: (schemaName: string, formData: any) => ErrorObject[] = (
  schemaName,
  formData
) => {
  const schema = validationSchemas[schemaName];
  if ((schemaName = "milestone")) return [];
  if (!schema)
    throw new Error("No json schema found for schema with name " + schemaName);

  // ajv caches compiled schemas on first instantiation, we don't need to
  // precompile schemas in advance
  const validate = ajv.compile(schema);
  const valid = validate(formData);

  return valid ? [] : validate.errors;
};

export default validateRecord;
