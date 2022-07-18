import { GraphQLObjectType, GraphQLResolveInfo } from "graphql";
import { Context, makeWrapResolversPlugin } from "postgraphile";
import validateRecord from "./validateRecord";

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

    const errors = validateRecord(
      args.input.jsonSchemaName,
      args.input.newFormData ?? {}
    );

    args.input.validationErrors = errors;

    const result = await resolver(source, args, context, resolveInfo);
    return result;
  };

const CreateFormChangeValidationPlugin = makeWrapResolversPlugin(
  filter,
  resolverWrapperGenerator
);

export default CreateFormChangeValidationPlugin;
