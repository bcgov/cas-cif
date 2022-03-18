import { WidgetProps } from "@rjsf/core";
import Textarea from "@button-inc/bcgov-theme/Textarea";
import FieldLabel from "./FieldLabel";

const TextAreaWidget: React.FC<WidgetProps> = ({
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
      <Textarea
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        value={value || ""}
        size={"medium"}
        resize="vertical"
        required={required}
        aria-label={label}
      />
      <style jsx>
        {`
          :global(textarea) {
            width: 100%;
            min-height: 10rem;
          }
        `}
      </style>
    </>
  );
};

export default TextAreaWidget;
