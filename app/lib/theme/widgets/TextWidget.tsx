import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

const TextWidget: React.FC<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <div>
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
          div :global(.pg-input, .pg-input input) {
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default TextWidget;
