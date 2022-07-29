import { WidgetProps } from "@rjsf/core";
import Input from "@button-inc/bcgov-theme/Input";

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
    <div className="inputWrapper">
      <Input
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        value={value || ""}
        size={"medium"}
        required={required}
        aria-label={label}
      />
      {uiSchema?.["ui:options"]?.contentSuffix}
      <style jsx>
        {`
          div :global(.pg-input, .pg-input input) {
            width: 100%;
          }
          .inputWrapper {
            display: flex;
            align-items: center;
            gap: 2rem;
          }
        `}
      </style>
    </div>
  );
};

export default TextWidget;
