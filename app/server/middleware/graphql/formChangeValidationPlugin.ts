import { makeWrapResolversPlugin } from "postgraphile";
import validationSchemas from "../../../data/jsonSchemaForm/validationSchemas";
import Ajv, { ErrorObject } from "ajv";

const ajv = new Ajv({ allErrors: true });

function validateRecord(schemaName: string, formData: any): ErrorObject[] {
  const schema = validationSchemas[schemaName];

  // ajv caches compiled schemas on first instantiation, we don't need to
  // precompile schemas in advance
  const validate = ajv.compile(schema);
  const valid = validate(formData);

  return valid ? [] : validate.errors;
}

export const FormChangeValidationPlugin = makeWrapResolversPlugin(
  (context) => {
    if (
      context.scope.isRootMutation &&
      context.scope.fieldName === "updateFormChange"
    ) {
      return {
        // There is no need to pass a context to the resolver at this time
      };
    }
    return null;
  },
  () => async (resolver: any, source, args, context, resolveInfo) => {
    // If the mutation doesn't change the form data, we don't need to re-validate
    if (args.input?.formChangePatch?.newFormData === undefined)
      return resolver();

    const {
      identifiers: [formChangeId],
    } = (resolveInfo as any).graphile.build.getTypeAndIdentifiersFromNodeId(
      args.input.id
    );

    // This is the recommended way to fetch data ahead of running the
    // resolver of the GraphQL mutation - see first "IMPORTANT" note here:
    // https://www.graphile.org/postgraphile/make-extend-schema-plugin/#the-selectgraphqlresultfromtable-helper
    const { pgClient } = context;
    const {
      rows: [formChangeRecord],
    } = await pgClient.query(
      `select json_schema_name from cif.form_change where id = $1`,
      [formChangeId]
    );

    const errors = validateRecord(
      formChangeRecord.json_schema_name,
      args.input.formChangePatch.newFormData
    );

    args.input.formChangePatch = {
      ...args.input.formChangePatch,
      validationErrors: errors,
    };

    const result = await resolver(source, args, context, resolveInfo);
    return result;
  }
);
