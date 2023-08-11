import validationSchemas from "../../../data/jsonSchemaForm/validationSchemas";
import { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { Context, makeWrapResolversPlugin } from "postgraphile";
import { CommitFormChangeInput } from "__generated__/commitFormChangeMutation.graphql";
import { StageFormChangeInput } from "__generated__/stageFormChangeMutation.graphql";
import { UpdateFormChangeInput } from "__generated__/updateFormChangeMutation.graphql";
import validateRecord from "./validateRecord";
import databaseSchemaConfiguration from "./databaseSchemaConfiguration";

interface Args {
  input: UpdateFormChangeInput | StageFormChangeInput | CommitFormChangeInput;
}

const DATABASE_SCHEMAS = databaseSchemaConfiguration;

export const filter = (context: Context<GraphQLObjectType<any, any>>) => {
  if (
    (context.scope.isRootMutation &&
      context.scope.fieldName === "updateFormChange") ||
    context.scope.fieldName === "updateMilestoneFormChange" ||
    context.scope.fieldName === "stageFormChange" ||
    context.scope.fieldName === "commitFormChange"
  ) {
    return {
      // There is no need to pass a context to the resolver at this time
    };
  }
  return null;
};

export const resolverWrapperGenerator =
  () =>
  async (
    resolver: any,
    source,
    args: Args,
    context,
    resolveInfo: GraphQLResolveInfo
  ) => {
    // If the mutation doesn't change the form data, we don't need to re-validate
    if (args.input?.formChangePatch?.newFormData === undefined)
      return resolver();

    // This is the recommended way to fetch data ahead of running the
    // resolver of the GraphQL mutation - see first "IMPORTANT" note here:
    // https://www.graphile.org/postgraphile/make-extend-schema-plugin/#the-selectgraphqlresultfromtable-helper
    const { pgClient } = context;
    const {
      rows: [formChangeRecord],
    } = await pgClient.query(
      `select json_schema_name from cif.form_change where id = $1`,
      [args.input.rowId]
    );

    let jsonSchema;

    if (DATABASE_SCHEMAS.includes(formChangeRecord.json_schema_name)) {
      const {
        rows: [fetchedRecord],
      } = await pgClient.query(
        `select json_schema from cif.form f
          join cif.form_change fc on
          f.slug = fc.json_schema_name
          and fc.id = $1`,
        [args.input.rowId]
      );
      jsonSchema = fetchedRecord.json_schema.schema;
    } else jsonSchema = validationSchemas[formChangeRecord.json_schema_name];

    if (!jsonSchema)
      throw new Error(
        "No json schema found for schema with name " +
          formChangeRecord.json_schema_name
      );

    const errors = validateRecord(
      jsonSchema,
      args.input.formChangePatch.newFormData
    );

    args.input.formChangePatch = {
      ...args.input.formChangePatch,
      validationErrors: errors,
    };

    const result = await resolver(source, args, context, resolveInfo);
    return result;
  };

const FormChangeValidationPlugin = makeWrapResolversPlugin(
  filter,
  resolverWrapperGenerator
);

export default FormChangeValidationPlugin;
