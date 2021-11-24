import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";
import getRequiredLabel from "../utils/getRequiredLabel";

const TextWidget: React.FunctionComponent<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <Input
      id={id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      label={getRequiredLabel(label, required)}
      value={value}
      size="medium"
      required={required}
    ></Input>
  );
};

export default TextWidget;
