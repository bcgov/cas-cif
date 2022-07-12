import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyAdjustableCalculatedValueWidget: React.FC<WidgetProps> = (
  props
) => {
  const { id, value, uiSchema, label, formContext } = props;

  // If we are using this widget to show numbers as money, we can set `isMoney` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;

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
              fixedDecimalScale={isMoney}
              id={id}
              prefix={isMoney ? "$" : ""}
              decimalScale={isMoney ? 2 : 10}
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
              decimalScale={isMoney ? 2 : 10}
              value={value}
              displayType="text"
            />
          </dd>
        </div>
      )}
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
