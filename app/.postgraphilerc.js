module.exports = {
  options: {
    appendPlugins: [
      "postgraphile-plugin-connection-filter",
      "@graphile-contrib/pg-many-to-many",
      "@graphile-contrib/pg-omit-archived",
      "@graphile-contrib/pg-order-by-related",
      `${process.cwd()}/server/middleware/graphql/uploadFieldPlugin.js`,
    ],
    graphileBuildOptions: {
      connectionFilterAllowNullInput: true,
      connectionFilterRelations: true,
      connectionFilterAllowEmptyObjectInput: true,
      pgStrictFunctions: true, // allows functions to be called with null arguments
      pgArchivedColumnName: "archived_at",
      pgArchivedColumnImpliesVisible: false,
      pgArchivedRelations: false,
      uploadFieldDefinitions: [
        {
          match: ({ schema, table, column, tags }) =>
            table === "attachment" && column === "file",
        },
      ],
    },
  },
};
