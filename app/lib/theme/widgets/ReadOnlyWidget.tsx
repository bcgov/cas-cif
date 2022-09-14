import { Textarea } from "@button-inc/bcgov-theme";
import Input from "@button-inc/bcgov-theme/Input";
import { WidgetProps } from "@rjsf/core";
const ReadOnlyWidget: React.FC<WidgetProps> = ({
  value,
  id,
  label,
  options,
}) => {
  return (
    <>
      <div>
        <input
          id={id}
          value={options.text ?? value ?? "Not added"}
          aria-label={label}
          readOnly
        />
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
      </div>
    </>
  );
};

export default ReadOnlyWidget;
