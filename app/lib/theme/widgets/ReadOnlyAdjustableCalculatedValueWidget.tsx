import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";
import CalculatedValueWidget from "./CalculatedValueWidget";

const ReadOnlyAdjustableCalculatedValueWidget: React.FC<WidgetProps> = (
  props
) => {
  const { id, value, uiSchema, label, formContext } = props;

  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  const adjustedInputId = `${id}_adjusted`;

  return (
    <>
      <CalculatedValueWidget {...props} />
      {value !== calculatedValue && (
        <div className={"adjustedValue"}>
          <dt>{label} (Adjusted)</dt>
          {value ? (
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
          ) : (
            <em>Not added</em>
          )}
          <style jsx>{`
            .adjustedValue {
              display: flex;
              flex-basis: 100%;
              padding-top: 0.5em;
            }
            dt {
              margin: 0 1em 0 0;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default ReadOnlyAdjustableCalculatedValueWidget;
