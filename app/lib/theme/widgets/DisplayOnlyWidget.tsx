import { WidgetProps } from "@rjsf/core";

const DisplayOnlyWidget: React.FC<WidgetProps> = ({ options }) => {
  return (
    <span className="paragraph-text">
      <label>{options.title}</label>
      <p>{options.text}</p>
    </span>
  );
};

export default DisplayOnlyWidget;
