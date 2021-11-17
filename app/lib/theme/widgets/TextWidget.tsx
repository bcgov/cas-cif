import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

const TextWidget: React.FunctionComponent<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value
}) => {
  return (
    <Input
      id={id}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      label={label}
      value={value}
      size="medium"
    ></Input>
  );
};

export default TextWidget;
