import { WidgetProps } from "@rjsf/core";
import { useEffect, useState } from "react";
import RadioButton from "@button-inc/bcgov-theme/RadioButton";
import NumberFormat from "react-number-format";

export const ConditionalAmountWidget: React.FC<WidgetProps> = (props) => {
  const { schema, id, label, onChange, value } = props;
  const [requireAmount, setRequireAmount] = useState(false);
  const [amount, setAmount] = useState(value);

  const handleRequireAmount = () => {
    setRequireAmount(true);
    setAmount(0);
    onChange(0);
  };

  const handleAmountNotRequired = () => {
    setRequireAmount(false);
    setAmount("");
    onChange("");
  };

  useEffect(() => {
    setAmount(value);
  }, [value]);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <RadioButton
          name="require-amount"
          checked={requireAmount}
          onChange={handleRequireAmount}
          label="Enter Amount:"
          className="radio-button"
        />
        <NumberFormat
          thousandSeparator
          fixedDecimalScale
          id={id}
          prefix="$"
          disabled={!requireAmount}
          className="money"
          decimalScale={2}
          defaultValue={(schema as any).defaultValue}
          value={amount}
          onValueChange={({ floatValue }) => {
            setAmount(floatValue);
            if (floatValue === undefined) onChange("INVALID VALUE");
            else onChange(((floatValue * 100) / 100).toFixed(2));
          }}
          style={{
            border: "2px solid #606060",
            borderRadius: "0.25em",
            padding: "0.5em",
            width: "50%",
            marginLeft: "2rem",
            marginTop: "0.5rem",
          }}
          aria-label={label}
        />
      </div>
      <RadioButton
        name="require-amount"
        checked={!requireAmount}
        onChange={handleAmountNotRequired}
        label="Not Applicable"
        className="radio-button"
      />
      <style jsx>
        {`
          div :global(input) {
            width: 100%;
          }
          div :global(.radio-button) {
            margin-top: 1rem;
            margin-left: 1rem;
          }
        `}
      </style>
    </div>
  );
};

export default ConditionalAmountWidget;
