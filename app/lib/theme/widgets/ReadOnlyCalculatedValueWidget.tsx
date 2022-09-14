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
              value={value}
              displayType="text"
            />
          }
        </>
      )}
      {value !== calculatedValue && (
        <div className={calculatedValue && "adjustedValue"}>
          {calculatedValue && <dt>{label} (Adjusted)</dt>}
          <dd>
            <NumberFormat
              thousandSeparator
              fixedDecimalScale={isMoney}
              id={adjustedInputId}
              prefix={isMoney ? "$" : ""}
              suffix={isPercentage ? "%" : ""}
              decimalScale={isMoney || isPercentage ? 2 : 10}
              value={value}
              displayType="text"
            />
          </dd>
        </div>
      )}
      {!value && <em>Not added</em>}
      <style jsx>{`
        div.adjustedValue {
          position: relative;
          display: flex;
          right: 12.1rem;
          margin-top: 0.5em;
        }
        dt {
          margin-right: 1em;
        }
      `}</style>
    </div>
  );
};

export default ReadOnlyAdjustableCalculatedValueWidget;
