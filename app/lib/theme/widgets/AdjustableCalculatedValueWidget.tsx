import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

/*
  to get the calculated value from formContext, we need to tweak the label of the field to match the calculated value in the formContext.
  for example, if the label is "Total Funding Request", we need to change it to "totalFundingRequest" and then add `CalculatedValue` to the end of the label.
*/
export const getFormattedLabel = (fieldLabel: string) =>
  fieldLabel.charAt(0).toLowerCase() + fieldLabel.slice(1).replace(/\s/g, "");

export const AdjustableCalculatedValueWidget: React.FC<WidgetProps> = (
  props
) => {
  const {
    schema,
    uiSchema,
    id,
    disabled,
    label,
    onChange,
    value,
    formContext,
  } = props;

  // If we are using this widget to show numbers as money, we can set `isMoney` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;

  const calculatedValue =
    formContext[`${getFormattedLabel(label)}CalculatedValue`];

  return (
    <div>
      {calculatedValue && (
        <>
          <div style={{ marginBottom: "1em" }}>
            {isMoney ? "$" : ""}
            {calculatedValue}
          </div>
          <label htmlFor={id}>{label} (Adjusted)</label>
        </>
      )}
      <NumberFormat
        thousandSeparator
        fixedDecimalScale={isMoney}
        id={id}
        prefix={isMoney ? "$" : ""}
        disabled={disabled}
        className="adjustable"
        decimalScale={isMoney ? 2 : 10} //Hardcoded for now, we can change it if we need to
        defaultValue={(schema as any).defaultValue}
        value={value ?? calculatedValue}
        onValueChange={({ floatValue }) => {
          if (
            Number.isNaN(floatValue) ||
            floatValue === undefined ||
            floatValue === null
          ) {
            onChange(calculatedValue);
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
