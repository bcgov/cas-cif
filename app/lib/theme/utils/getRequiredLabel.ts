const getRequiredLabel = (label: string, required: boolean) =>
  label + (required ? "" : " (optional)");

export default getRequiredLabel;
