import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyPercentageWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <dd>
      {value ? (
        <NumberFormat
          fixedDecimalScale
          id={id}
          suffix=" %"
          className="money"
          decimalScale={0}
          value={value}
          displayType="text"
        />
      ) : (
        <em>Not added</em>
      )}
    </dd>
  );
};

export default ReadOnlyPercentageWidget;
