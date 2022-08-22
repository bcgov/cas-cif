import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

export const NumberWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  uiSchema,
  value,
  label,
  onChange,
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  // If we need to set the amount of decimal places, we can set it in the uiSchema, otherwise there will be no decimal places.
  const numberOfDecimalPlaces = isMoney
    ? 2
    : uiSchema.numberOfDecimalPlaces ?? 0;

  return (
    <div>
      <NumberFormat
        thousandSeparator
        fixedDecimalScale={numberOfDecimalPlaces}
        decimalScale={numberOfDecimalPlaces}
        id={id}
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? " %" : ""}
        disabled={disabled}
        className="decimal"
        defaultValue={(schema as any).defaultValue}
        value={value ?? ""}
        onValueChange={({ floatValue }) => {
          if (
            Number.isNaN(floatValue) ||
            floatValue === undefined ||
            floatValue === null
          ) {
            onChange("");
          } else {
            onChange(floatValue.toFixed(numberOfDecimalPlaces));
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

export default NumberWidget;
