const projectManagerSchema = {
  $schema: "http://json-schema.org/draft-07/schema",
  type: "object",
  title: "Project Manager",
  required: ["cifUserId"],
  properties: {
    cifUserId: {
      type: "number",
      title: "Project Manager",
      default: undefined,
      // anyOf needs to be included in the base schema, even if it's undefined at this point
      // otherwise rjsf's deepEqual method trips and triggers an extra change event on form load.
      anyOf: undefined,
    },
  },
};

export default projectManagerSchema;
