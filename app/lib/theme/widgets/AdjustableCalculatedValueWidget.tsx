import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

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
    formContext[uiSchema.calculatedValueFormContextProperty];

  const adjustedInputId = `${id}_adjusted`;

  return (
    <div>
      {calculatedValue && (
        <>
          <NumberFormat
            thousandSeparator
            fixedDecimalScale={isMoney}
            id={id}
            prefix={isMoney ? "$" : ""}
            disabled={disabled}
            className="adjustable"
            decimalScale={isMoney ? 2 : 10} //Hardcoded for now, we can change it if we need to
            defaultValue={(schema as any).defaultValue}
            value={calculatedValue}
            displayType="text"
          />
          <label htmlFor={adjustedInputId}>{label} (Adjusted)</label>
        </>
      )}
      <NumberFormat
        thousandSeparator
        fixedDecimalScale={isMoney}
        id={adjustedInputId}
        prefix={isMoney ? "$" : ""}
        disabled={disabled}
        className="adjustable"
        decimalScale={isMoney ? 2 : 10} //Hardcoded for now, we can change it if we need to
        defaultValue={(schema as any).defaultValue}
        value={value}
        onValueChange={({ floatValue }) => {
          if (
            Number.isNaN(floatValue) ||
            floatValue === undefined ||
            floatValue === null
          ) {
            onChange(null);
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
