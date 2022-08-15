import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

export const DecimalWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  uiSchema,
  value,
  label,
  onChange,
}) => {
  return (
    <div>
      <NumberFormat
        fixedDecimalScale={uiSchema.decimals}
        id={id}
        disabled={disabled}
        className="decimal"
        decimalScale={uiSchema.decimals}
        defaultValue={(schema as any).defaultValue}
        value={value}
        onChange={(e) => onChange(e.target.value || undefined)}
        style={{
          border: "2px solid #606060",
          borderRadius: "0.25em",
          padding: "0.5em",
        }}
        aria-label={label}
      />
      <style jsx>
        {`
          div :global(input) {
            width: 100%;
          }
          div :global(.decimal:focus) {
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

export default DecimalWidget;
