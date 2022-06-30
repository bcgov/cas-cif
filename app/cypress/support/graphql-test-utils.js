export const hasOperationName = (req, operationName) => {
  const { body } = req;
  return body.hasOwnProperty("id") && body.id === operationName;
};

// Alias query if operationName matches
export const aliasQuery = (req, operationName) => {
  if (hasOperationName(req, operationName)) {
    req.alias = `gql${operationName}`;
    console.log(req.alias);
  }
};
