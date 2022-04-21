import { WidgetProps } from "@rjsf/core";

const DisplayOnlyWidget: React.FC<WidgetProps> = ({ options, id }) => {
  return <span id={id}>{options.text}</span>;
};

export default DisplayOnlyWidget;
