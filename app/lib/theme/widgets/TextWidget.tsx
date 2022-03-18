import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

import FieldLabel from "./FieldLabel";

const TextWidget: React.FC<WidgetProps> = ({
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
      <FieldLabel
        htmlFor={id}
        label={label}
        required={required}
        uiSchema={uiSchema}
      ></FieldLabel>
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        value={value || ""}
        size={"medium"}
        required={required}
        aria-label={label}
      />
      <style jsx>
        {`
          :global(.pg-input, .pg-input input) {
            width: 100%;
          }
        `}
      </style>
    </>
  );
};

export default TextWidget;
