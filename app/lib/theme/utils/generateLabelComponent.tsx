import { UiSchema } from "@rjsf/core";
import getRequiredLabel from "./getRequiredLabel";

export const generateLabelComponent = (
  label: string,
  required: boolean,
  htmlFor: string,
  uiSchema?: UiSchema
) => {
  if (
    uiSchema &&
    uiSchema["ui:options"] &&
    uiSchema["ui:options"].label === false
  ) {
    return null;
  }
  return <label htmlFor={htmlFor}>{getRequiredLabel(label, required)}</label>;
};
