import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import { generateLabelComponent } from "../utils/generateLabelComponent";

export const MoneyWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  label,
  required,
  onChange,
  value,
  uiSchema,
}) => {
  return (
    <>
      {generateLabelComponent(label, required, id, uiSchema)}
      <NumberFormat
        thousandSeparator
        fixedDecimalScale
        id={id}
        prefix="$"
        disabled={disabled}
        className="money"
        decimalScale={2}
        defaultValue={(schema as any).defaultValue}
        value={value}
        onValueChange={({ floatValue }) =>
          onChange(((floatValue * 100) / 100).toFixed(2))
        }
        style={{
          border: "2px solid #606060",
          borderRadius: "0.25em",
          padding: "0.5em",
        }}
      />
    </>
  );
};

export default MoneyWidget;
