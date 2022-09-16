import { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { Context, makeWrapResolversPlugin } from "postgraphile";
import { CommitFormChangeInput } from "__generated__/commitFormChangeMutation.graphql";
import { StageFormChangeInput } from "__generated__/stageFormChangeMutation.graphql";
import { UpdateFormChangeInput } from "__generated__/updateFormChangeMutation.graphql";
import validateRecord from "./validateRecord";

interface Args {
  input: UpdateFormChangeInput | StageFormChangeInput | CommitFormChangeInput;
}

export const filter = (context: Context<GraphQLObjectType<any, any>>) => {
  if (
    (context.scope.isRootMutation &&
      context.scope.fieldName === "updateFormChange") ||
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
      rows: [formJsonSchema],
    } = await pgClient.query(
      `select json_schema from cif.form where slug = (select json_schema_name from cif.form_change where id = $1)`,
      [args.input.rowId]
    );

    const errors = validateRecord(
      formJsonSchema.json_schema.schema,
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
