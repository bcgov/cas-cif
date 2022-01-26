export default function getProjectManagerSchema() {
  return {
    $schema: "http://json-schema.org/draft-07/schema",
    type: "object",
    title: "Project Manager",
    required: ["cifUserId"],
    properties: {
      cifUserId: {
        type: "number",
        title: "Project Manager",
        default: undefined,
        anyOf: undefined,
      },
    },
  };
}
