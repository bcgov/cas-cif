import { WidgetProps } from "@rjsf/core";
import { useEffect, useState } from "react";
import NumberFormat from "react-number-format";

export const MoneyWidget: React.FC<WidgetProps> = ({
  schema,
  id,
  disabled,
  label,
  onChange,
  value,
}) => {
  const [totalFunding, setTotalFunding] = useState(value || "");

  useEffect(() => {
    setTotalFunding(value);
  }, [value]);

  return (
    <div>
      <NumberFormat
        thousandSeparator
        fixedDecimalScale
        id={id}
        prefix="$"
        disabled={disabled}
        className="money"
        decimalScale={2}
        defaultValue={(schema as any).defaultValue}
        value={totalFunding || ""}
        onValueChange={({ floatValue }) => {
          setTotalFunding(floatValue);
          onChange(((floatValue * 100) / 100).toFixed(2));
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

export default MoneyWidget;
