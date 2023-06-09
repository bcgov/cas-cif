import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import CalculatedValueWidget from "./CalculatedValueWidget";
import ContextualHelp from "./ContextualHelp";

export const AdjustableCalculatedValueWidget: React.FC<WidgetProps> = (
  props
) => {
  const { uiSchema, id, disabled, label, onChange, value } = props;

  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  // If we need to set the amount of decimal places, we can set it in the uiSchema, otherwise there will be no decimal places.
  const numberOfDecimalPlaces = isMoney
    ? 2
    : uiSchema?.numberOfDecimalPlaces ?? 0;

  const adjustedInputId = `${id}_adjusted`;

  return (
    <div>
      <CalculatedValueWidget {...props} />
      <div
        style={{
          padding: "2em 0 0 0",
        }}
      >
        <label htmlFor={adjustedInputId}>{label} (Adjusted)</label>
        <ContextualHelp
          text="<div><ul><li>This field is mainly used for rounding purposes.</li><li>If filled out, the adjusted value here will be used for other calculations.</li></ul></div>"
          label={`${label} (Adjusted)`}
        />
      </div>
      <NumberFormat
        thousandSeparator
        fixedDecimalScale={isMoney || isPercentage}
        id={adjustedInputId}
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? "%" : ""}
        disabled={disabled}
        className="adjustable"
        decimalScale={numberOfDecimalPlaces}
        value={value}
        onValueChange={({ floatValue }) => {
          if (
            Number.isNaN(floatValue) ||
            floatValue === undefined ||
            floatValue === null
          ) {
            onChange(undefined);
          } else {
            onChange(((floatValue * 100) / 100).toFixed(isMoney ? 2 : 10)); //Hardcoded for now, we can change it if we need to
          }
        }}
        style={{
          border: "2px solid #606060",
          borderRadius: "0.25em",
          padding: "0.5em",
        }}
        aria-label={`${label} (Adjusted)`}
      />
      <style jsx>
        {`
          .readonly {
            margin-bottom: 1em;
          }
          div :global(input) {
            width: 100%;
          }
          div :global(.adjustable:focus) {
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
