import { WidgetProps } from "@rjsf/core";
import CalculatedValueWidget from "./CalculatedValueWidget";

const RankWidget: React.FC<WidgetProps> = (props) => {
  return (
    <>
      <CalculatedValueWidget
        {...props}
        message={
          "Enter a project score to see the ranking compared to other scored projects."
        }
      />
    </>
  );
};

export default RankWidget;
