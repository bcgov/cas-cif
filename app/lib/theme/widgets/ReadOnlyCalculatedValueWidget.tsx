import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyCalculatedValueWidget: React.FC<WidgetProps> = ({
  id,
  formContext,

  uiSchema,
}) => {
  // If we are using this widget to show numbers as money or percent, we can set `isMoney` or `isPercent` to true in the uiSchema.
  const isMoney = uiSchema?.isMoney;
  const isPercent = uiSchema?.isPercent;

  const calculatedValue =
    formContext[uiSchema.calculatedValueFormContextProperty];

  return (
    <dd id={id}>
      {calculatedValue !== null && calculatedValue !== undefined ? (
        <NumberFormat
          fixedDecimalScale={isMoney || isPercent}
          prefix={isMoney ? "$" : ""}
          suffix={isPercent ? "%" : ""}
          decimalScale={isMoney || isPercent ? 2 : 10} //Hardcoded for now, we can change it if we need to
          value={calculatedValue}
          displayType="text"
        />
      ) : (
        <NumberFormat
          fixedDecimalScale={isMoney || isPercent}
          prefix={isMoney ? "$" : ""}
          suffix={isPercent ? "%" : ""}
          decimalScale={isMoney || isPercent ? 2 : 10}
          value={""}
          displayType="text"
        />
      )}
    </dd>
  );
};

export default ReadOnlyCalculatedValueWidget;
