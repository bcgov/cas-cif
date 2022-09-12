import { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { Context, makeWrapResolversPlugin } from "postgraphile";
import validateRecord from "./validateRecord";
import databaseSchemaConfiguration from "./databaseSchemaConfiguration";
import validationSchemas from "../../../data/jsonSchemaForm/validationSchemas";

const DATABASE_SCHEMAS = databaseSchemaConfiguration;

export const filter = (context: Context<GraphQLObjectType<any, any>>) => {
  if (
    context.scope.isRootMutation &&
    context.scope.fieldName === "createFormChange"
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
    args: { [argName: string]: any },
    context,
    resolveInfo: GraphQLResolveInfo
  ) => {
    if (!args.input.jsonSchemaName) {
      throw new Error("JSON schema must be set in the mutation input");
    }
    const { pgClient } = context;

    let jsonSchema;

    if (DATABASE_SCHEMAS.includes(args.input.jsonSchemaName)) {
      const {
        rows: [fetchedRecord],
      } = await pgClient.query(
        `select json_schema from cif.form
         where slug = $1`,
        [args.input.jsonSchemaName]
      );
      jsonSchema = fetchedRecord.json_schema.schema;
    } else jsonSchema = validationSchemas[args.input.jsonSchemaName];

    const errors = validateRecord(jsonSchema, args.input.newFormData ?? {});

    args.input.validationErrors = errors;

    const result = await resolver(source, args, context, resolveInfo);
    return result;
  };

const CreateFormChangeValidationPlugin = makeWrapResolversPlugin(
  filter,
  resolverWrapperGenerator
);

export default CreateFormChangeValidationPlugin;
