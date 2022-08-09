import { WidgetProps } from "@rjsf/core";
import { getLocaleFormattedDate } from "../getLocaleFormattedDate";

const ReadOnlyDateWidget: React.FC<WidgetProps> = ({ value, options }) => {
  return (
    <>
      <dd>{value ? getLocaleFormattedDate(value) : <em>Not added</em>}</dd>
      <dd className="contentSuffix">{value && options.contentSuffix}</dd>
      <style jsx>{`
        dd {
          line-height: 1.2;
          margin: 0;
        }
        .contentSuffix {
          margin-left: 1em;
        }
      `}</style>
    </>
  );
};

export default ReadOnlyDateWidget;
