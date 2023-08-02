import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const CalculatedValueWidget: React.FC<WidgetProps> = ({
  id,
  formContext,
  label,
  uiSchema,
  message = "This field cannot be calculated due to lack of information now.",
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  // If we need to set the amount of decimal places, we can set it in the uiSchema, otherwise there will be no decimal places.
  const numberOfDecimalPlaces = isMoney
    ? 2
    : uiSchema?.numberOfDecimalPlaces ?? 0;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  return (
    <>
      <div>
        {calculatedValue !== null && calculatedValue !== undefined ? (
          <NumberFormat
            thousandSeparator
            fixedDecimalScale={isMoney || isPercentage}
            prefix={isMoney ? "$" : ""}
            suffix={isPercentage ? "%" : ""}
            id={id}
            decimalScale={numberOfDecimalPlaces}
            value={calculatedValue}
            displayType="text"
            // This is required since we render a <span> component
            aria-label={label}
          />
        ) : (
          <em>{uiSchema.message ?? message}</em>
        )}
      </div>
      <style jsx>{`
         {
          dd {
            margin-bottom: 0;
          }
        }
      `}</style>
    </>
  );
};

export default CalculatedValueWidget;
