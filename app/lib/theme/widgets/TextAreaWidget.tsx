import { WidgetProps } from "@rjsf/core";
import Textarea from "@button-inc/bcgov-theme/Textarea";

const TextAreaWidget: React.FC<WidgetProps> = ({
  id,
  placeholder,
  onChange,
  label,
  value,
  required,
}) => {
  return (
    <div>
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
          div :global(textarea) {
            width: 100%;
            min-height: 10rem;
          }
        `}
      </style>
    </div>
  );
};

export default TextAreaWidget;
