import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

const TextWidget: React.FunctionComponent<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
}) => {
  return (
    <Input
      id={id}
      onChange={(e) => {
        console.log(e);
        onChange(e.target.value);
      }}
      placeholder={placeholder}
      label={label}
      size="medium"
    ></Input>
  );
};

export default TextWidget;
