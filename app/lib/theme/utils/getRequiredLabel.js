const REQUIRED_SYMBOL = "*";

const getRequiredLabel = (label, required) =>
  label + (required ? REQUIRED_SYMBOL : "");

export default getRequiredLabel;
