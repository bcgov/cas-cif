module.exports = {
  options: {
    appendPlugins: [
      "postgraphile-plugin-connection-filter",
      "@graphile-contrib/pg-many-to-many",
      "postgraphile-plugin-upload-field",
    ],
    graphileBuildOptions: {
      connectionFilterAllowNullInput: true,
      connectionFilterRelations: true,
      uploadFieldDefinitions: [
        {
          match: ({ schema, table, column, tags }) =>
            table === "attachment" && column == "file",
        },
      ],
    },
  },
};
