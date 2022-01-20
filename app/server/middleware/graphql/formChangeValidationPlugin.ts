import { makeWrapResolversPlugin } from "postgraphile";

export const FormChangeValidationPlugin = makeWrapResolversPlugin(
  (context) => {
    if (
      context.scope.isRootMutation &&
      context.scope.fieldName === "updateProjectRevision"
    ) {
      console.error(
        "~~~~~~~~~~~~~~~~~~~ Loading Validation Plugin ~~~~~~~~~~~~~~~~~~~"
      );
      return {
        // There is no need to pass a context to the resolver at this time
      };
    }
    return null;
  },
  () => async (resolver: any, _source, args, context, resolveInfo) => {
    console.error(
      "~~~~~~~~~~~~~~~~~~~ Executing Validation Plugin ~~~~~~~~~~~~~~~~~~~"
    );
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

    console.error(rows);

    const result = await resolver();
    return result;
  }
);
