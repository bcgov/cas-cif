import { WidgetProps } from "@rjsf/core";
import ReadOnlyCalculatedValueWidget from "./ReadOnlyCalculatedValueWidget";

const RankWidget: React.FC<WidgetProps> = (props) => {
  return (
    <>
      <ReadOnlyCalculatedValueWidget
        {...props}
        message={
          "Enter a project score to see the ranking compared to other scored projects."
        }
      />

      <style jsx>{`
         {
          dd {
            margin-bottom: 0;
          }
        }
      `}</style>
    </>
  );
};

export default RankWidget;
