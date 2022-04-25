import { WidgetProps } from "@rjsf/core";
import NumberFormat from "react-number-format";

const ReadOnlyMoneyWidget: React.FC<WidgetProps> = ({ id, value }) => {
  return (
    <dd>
      {value ? (
        <NumberFormat
          thousandSeparator
          fixedDecimalScale
          id={id}
          prefix="$"
          className="money"
          decimalScale={2}
          value={value}
          displayType="text"
        />
      ) : (
        <em>Not added</em>
      )}
    </dd>
  );
};

export default ReadOnlyMoneyWidget;
