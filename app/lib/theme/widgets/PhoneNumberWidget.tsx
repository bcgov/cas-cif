import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const PhoneNumberWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  label,
  onChange,
  value,
}) => {
  return (
    <>
      <NumberFormat
        isNumericString
        allowEmptyFormatting
        id={id}
        type="tel"
        disabled={disabled}
        format="(###) ###-####"
        mask="_"
        aria-label={label}
        defaultValue={(schema as any).defaultValue}
        value={value?.replace("+1", "")}
        onValueChange={({ value: newValue }) => {
          if (!newValue) {
            onChange(undefined);
          } else {
            onChange(`+1${newValue}`);
          }
        }}
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

export default PhoneNumberWidget;
