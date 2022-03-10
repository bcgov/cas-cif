import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import FieldLabel from "./FieldLabel";

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
    <div>
      <FieldLabel
        label={label}
        required={required}
        htmlFor={id}
        uiSchema={uiSchema}
      />
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
      <style jsx>
        {`
          div :global(input) {
            width: 100%;
          }
          div :global(.money:focus) {
            outline-style: solid;
            outline-width: 4px;
            outline-color: #3b99fc;
            outline-offset: 1px;
          }
        `}
      </style>
    </div>
  );
};

export default MoneyWidget;
