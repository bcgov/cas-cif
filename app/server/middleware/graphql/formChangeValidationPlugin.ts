import { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { Context, makeWrapResolversPlugin } from "postgraphile";
import validateRecord from "./validateRecord";

export const filter = (context: Context<GraphQLObjectType<any, any>>) => {
  if (
    context.scope.isRootMutation &&
    context.scope.fieldName === "updateFormChange"
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
  };

const FormChangeValidationPlugin = makeWrapResolversPlugin(
  filter,
  resolverWrapperGenerator
);

export default FormChangeValidationPlugin;
