import React from "react";
import NumberFormat from "react-number-format";

interface Props {
  amount: number;
}

export const Money: React.FC<Props> = ({ amount }) => {
  const fixedDecimalAmount = Math.round((amount * 100) / 100).toFixed(2);
  return (
    <NumberFormat
      value={fixedDecimalAmount}
      displayType="text"
      isNumericString
      thousandSeparator
      prefix="$"
      // remove the wrapping span NumberFormat uses by default.
      renderText={(formattedValue) => {
        return formattedValue;
      }}
    />
  );
};

export default Money;
