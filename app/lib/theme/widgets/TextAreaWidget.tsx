import { WidgetProps } from "@rjsf/core";
import getRequiredLabel from "../utils/getRequiredLabel";
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
    <>
      <Textarea
        id={id}
        onChange={(e) => onChange(e.target.value || undefined)}
        placeholder={placeholder}
        label={getRequiredLabel(label, required)}
        value={value || ""}
        size={"medium"}
        resize="vertical"
        required={required}
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
