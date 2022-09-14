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

  const selectMessageIfNullProperty = (schemaProperty) => {
    switch (schemaProperty) {
      case "calculatedRank":
        return "Please enter a score in the above field to see the ranking of this project comparing to other ones with scores entered.";
      default:
        return "";
    }
  };

  return (
    <>
      <div aria-label={label}>
        {calculatedValue !== null && calculatedValue !== undefined ? (
          <NumberFormat
            fixedDecimalScale={isMoney || isPercentage}
            prefix={isMoney ? "$" : ""}
            suffix={isPercentage ? "%" : ""}
            id={id}
            decimalScale={isMoney || isPercentage ? 2 : 10} //Hardcoded for now, we can change it if we need to
            value={calculatedValue}
            displayType="text"
          />
        ) : (
          <em>
            {selectMessageIfNullProperty(
              uiSchema.calculatedValueFormContextProperty
            )}
          </em>
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

export default ReadOnlyCalculatedValueWidget;
