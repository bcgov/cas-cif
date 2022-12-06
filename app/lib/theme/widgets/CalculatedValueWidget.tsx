import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const CalculatedValueWidget: React.FC<WidgetProps> = ({
  id,
  formContext,
  label,
  uiSchema,
  message = "",
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  return (
    <>
      <div>
        {calculatedValue !== null && calculatedValue !== undefined ? (
          <NumberFormat
            thousandSeparator={isMoney}
            fixedDecimalScale={isMoney || isPercentage}
            prefix={isMoney ? "$" : ""}
            suffix={isPercentage ? "%" : ""}
            id={id}
            decimalScale={isMoney || isPercentage ? 2 : 10} //Hardcoded for now, we can change it if we need to
            value={calculatedValue}
            displayType="text"
            // This is required since we render a <span> component
            aria-label={label}
          />
        ) : (
          <em>{message}</em>
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
