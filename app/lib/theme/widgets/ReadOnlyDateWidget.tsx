import { WidgetProps } from "@rjsf/core";
import { getLocaleFormattedDate } from "../getLocaleFormattedDate";

const ReadOnlyDateWidget: React.FC<WidgetProps> = ({ value }) => {
  return (
    <>
      <dd>{value ? getLocaleFormattedDate(value) : <em>Not added</em>}</dd>
      <style jsx>{`
        dd {
          line-height: 1.2;
          margin: 0;
        }
      `}</style>
    </>
  );
};

export default ReadOnlyDateWidget;
