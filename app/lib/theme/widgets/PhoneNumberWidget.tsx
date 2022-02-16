import { WidgetProps } from "@rjsf/core";
import getRequiredLabel from "../utils/getRequiredLabel";
import NumberFormat from "react-number-format";

const TextWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  label,
  required,
  onChange,
  value,
}) => {
  return (
    <>
      <label htmlFor={id}>{getRequiredLabel(label, required)}</label>
      <NumberFormat
        isNumericString
        allowEmptyFormatting
        id={id}
        type="tel"
        disabled={disabled}
        format="(###) ###-####"
        mask="_"
        defaultValue={(schema as any).defaultValue}
        value={value?.replace("+1", "")}
        onValueChange={({ value: newValue }) => onChange(`+1${newValue}`)}
        style={{
          border: "2px solid #606060",
          borderRadius: "0.25em",
          padding: "0.5em",
          width: "100%",
        }}
      />
    </>
  );
};

export default TextWidget;
