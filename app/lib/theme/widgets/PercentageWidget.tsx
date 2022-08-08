import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const PercentageWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  label,
  onChange,
  value,
}) => {
  return (
    <div>
      <NumberFormat
        fixedDecimalScale
        id={id}
        suffix=" %"
        disabled={disabled}
        className="percentage"
        decimalScale={0}
        defaultValue={(schema as any).defaultValue}
        value={value ?? ""}
        onValueChange={({ floatValue }) => {
          if (
            Number.isNaN(floatValue) ||
            floatValue === undefined ||
            floatValue === null ||
            floatValue < 0 ||
            floatValue > 100
          ) {
            onChange("");
          } else {
            onChange(floatValue.toFixed(2));
          }
        }}
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

export default PercentageWidget;
