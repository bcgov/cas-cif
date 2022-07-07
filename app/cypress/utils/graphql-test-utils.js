// Utility to match GraphQL operation based on the operation name
export const hasOperationName = (req, operationName) => {
  const { body } = req;
  return body.hasOwnProperty("id") && body.id === operationName;
};

// Alias operation if operationName matches
export const aliasOperation = (req, operationName) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}`;
  }
};
