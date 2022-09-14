import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyAdjustableCalculatedValueWidget: React.FC<WidgetProps> = (
  props
) => {
  const { id, value, uiSchema, label, formContext } = props;

  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  // If we need to set the amount of decimal places, we can set it in the uiSchema, otherwise there will be no decimal places.
  const numberOfDecimalPlaces = isMoney
    ? 2
    : uiSchema.numberOfDecimalPlaces ?? 0;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  const adjustedInputId = `${id}_adjusted`;

  return (
    <div>
      {calculatedValue && (
        <>
          {
            <NumberFormat
              thousandSeparator
              fixedDecimalScale={numberOfDecimalPlaces}
              decimalScale={numberOfDecimalPlaces}
              id={id}
              prefix={isMoney ? "$" : ""}
              suffix={isPercentage ? "%" : ""}
              value={value ?? "Not added"}
              readOnly
              style={{
                border: "none",
                padding: "0 0 0 0.75em",
                fontStyle: `${value ?? "italic"}`,
              }}
            />
          }
        </>
      )}
    </div>
  );
};

export default ReadOnlyAdjustableCalculatedValueWidget;
