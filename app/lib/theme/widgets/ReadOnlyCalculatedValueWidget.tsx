import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyCalculatedValueWidget: React.FC<WidgetProps> = ({
  id,
  formContext,
  label,
  uiSchema,
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  return (
    <>
      <NumberFormat
        fixedDecimalScale={isMoney || isPercentage}
        prefix={isMoney ? "$" : ""}
        suffix={isPercentage ? "%" : ""}
        id={id}
        decimalScale={isMoney || isPercentage ? 2 : 10} //Hardcoded for now, we can change it if we need to
        value={
          calculatedValue !== null && calculatedValue !== undefined
            ? calculatedValue
            : ""
        }
        readOnly
        aria-label={label}
        style={{
          border: "none",
          padding: "0 0 0 0.75em",
        }}
      />
    </>
  );
};

export default ReadOnlyCalculatedValueWidget;
