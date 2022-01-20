const camelToSnakeCase = (str: string) => {
  return str.replace(/([A-Z])/g, function (_match, group) {
    return "_" + group.toLowerCase();
  });
};

export default camelToSnakeCase;
