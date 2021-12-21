import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";
import getRequiredLabel from "../utils/getRequiredLabel";

const TextWidget: React.FC<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <>
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        label={getRequiredLabel(label, required)}
        value={value || ""}
        size={"medium"}
        required={required}
      />
      <style jsx>
        {`
          :global(.pg-input) {
            width: 100%;
          }
        `}
      </style>
    </>
  );
};

export default TextWidget;
