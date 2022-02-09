import { UiSchema } from "@rjsf/core";
import getRequiredLabel from "../utils/getRequiredLabel";

interface Props {
  label: string;
  required: boolean;
  htmlFor: string;
  uiSchema?: UiSchema;
}

const FieldLabel: React.FC<Props> = ({
  label,
  required,
  htmlFor,
  uiSchema,
}) => {
  if (
    uiSchema &&
    uiSchema["ui:options"] &&
    uiSchema["ui:options"].label === false
  ) {
    return null;
  }
  return <label htmlFor={htmlFor}>{getRequiredLabel(label, required)}</label>;
};

export default FieldLabel;
