import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyNumberWidget: React.FC<WidgetProps> = ({
  id,
  value,
  uiSchema,
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
      {value ? (
        <NumberFormat
          value={value}
          displayType="text"
          thousandSeparator
          fixedDecimalScale={numberOfDecimalPlaces}
          decimalScale={numberOfDecimalPlaces}
          id={id}
          prefix={isMoney ? "$" : ""}
          suffix={isPercentage ? " %" : ""}
          className="decimal"
        />
      ) : (
        <em>Not added</em>
      )}
      <style jsx>{`
        dd {
          margin: 0;
        }
      `}</style>
    </dd>
  );
};

export default ReadOnlyNumberWidget;
