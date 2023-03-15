const projectManagerSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project Manager",
  /*
     Despite the cifUserId being required in the database for the project_manager table, we are not requiring it in this schema.
     This is because we create an empty dropdown select form for each project_manager_label record,
     where a selection is not required to create a project. So we don't want to validate the cifUserId as required here.
  */
  properties: {
    cifUserId: {
      type: "number",
      title: "Project Manager",
    },
  },
};

export default projectManagerSchema;
