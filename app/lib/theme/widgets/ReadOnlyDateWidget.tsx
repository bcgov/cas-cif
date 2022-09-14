import { WidgetProps } from "@rjsf/core";
import { getLocaleFormattedDate } from "../getLocaleFormattedDate";

const ReadOnlyDateWidget: React.FC<WidgetProps> = ({
  value,
  options,
  label,
}) => {
  return (
    <>
      <input
        value={value ? getLocaleFormattedDate(value) : "Not added"}
        area-label={label}
      />
      <dd className="contentSuffix">{value && options.contentSuffix}</dd>
      <style jsx>{`
        input {
          border: none;
          // brianna figure this out with the labels that pop onto two lines
          padding-left: 0.75em;
          font-style: ${options.text ?? value ?? "italic"};
          width: 500px;
        }
        .contentSuffix {
          margin-left: 1em;
        }
      `}</style>
    </>
  );
};

export default ReadOnlyDateWidget;
