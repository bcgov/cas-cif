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
  uiSchema,
}) => {
  return (
    <>
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        label={getRequiredLabel(label, required)}
        value={value || ""}
        size={(uiSchema && uiSchema["bcgov:size"]) || "medium"}
        required={required}
      />
      <style jsx>
        {`
          :global(input) {
            width: 100%;
          }
        `}
      </style>
    </>
  );
};

export default TextWidget;
