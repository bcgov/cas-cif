import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyNumberWidget: React.FC<WidgetProps> = ({
  id,
  value,
  uiSchema,
  options,
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercentage` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercentage = uiSchema?.isPercentage;

  // If we need to set the amount of decimal places, we can set it in the uiSchema, otherwise there will be no decimal places.
  const numberOfDecimalPlaces = isMoney
    ? 2
    : uiSchema?.numberOfDecimalPlaces ?? 0;

  return (
    <dd>
      {value !== null && value !== undefined ? (
        <>
          <NumberFormat
            value={value}
            displayType="text"
            thousandSeparator
            fixedDecimalScale={isMoney || isPercentage}
            decimalScale={numberOfDecimalPlaces}
            id={id}
            prefix={isMoney ? "$" : ""}
            suffix={isPercentage ? " %" : ""}
            className="decimal"
          />
          <span className="contentSuffix">{options?.contentSuffix}</span>
        </>
      ) : (
        <em>Not added</em>
      )}
      <style jsx>{`
        dd {
          margin: 0;
        }
        .contentSuffix {
          margin-left: 1em;
        }
      `}</style>
    </dd>
  );
};

export default ReadOnlyNumberWidget;
