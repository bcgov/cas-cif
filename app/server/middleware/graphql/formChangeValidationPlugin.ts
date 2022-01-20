import { makeWrapResolversPlugin } from "postgraphile";
import validationSchemas from "../../../data/jsonSchemaForm/validationSchemas";
import Ajv, { ErrorObject } from "ajv";

const ajv = new Ajv({ allErrors: true });

function validateRecord(record: any): ErrorObject[] {
  const schema = validationSchemas[record.form_data_table_name];
  const jsonData = record.new_form_data;

  // ajv caches compiled schemas, so we don't have to
  // precompile schemas in advance
  const validate = ajv.compile(schema);
  const valid = validate(jsonData);

  return valid ? [] : validate.errors;
}

export const FormChangeValidationPlugin = makeWrapResolversPlugin(
  (context) => {
    if (
      context.scope.isRootMutation &&
      context.scope.fieldName === "updateProjectRevision"
    ) {
      return {
        // There is no need to pass a context to the resolver at this time
      };
    }
    return null;
  },
  () => async (resolver: any, _source, args, context, resolveInfo) => {
    const {
      identifiers: [projectRevisionId],
    } = (resolveInfo as any).graphile.build.getTypeAndIdentifiersFromNodeId(
      args.input.id
    );

    console.error("ProjectRevisionId", projectRevisionId);

    const { pgClient } = context;
    const { rows } = await pgClient.query(
      `select * from cif.form_change where project_revision_id = $1 and deleted_at is null`,
      [projectRevisionId]
    );

    const allErrors = rows
      .map((record) => validateRecord(record))
      .reduce((acc, errors) => [...acc, ...errors], []) as ErrorObject[];

    if (allErrors.length > 0)
      throw new Error(
        allErrors.map((e) => `${e.instancePath} ${e.message}`).join(" \n")
      );

    const result = await resolver();
    return result;
  }
);
