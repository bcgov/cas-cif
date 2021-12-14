import { WidgetProps } from "@rjsf/core";

const DisplayOnlyWidget: React.FC<WidgetProps> = ({ options }) => {
  return (
    <span className="paragraph-text">
      <label>{options.title}</label>
      <p>{options.text}</p>
      <style jsx>{`
        h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
      `}</style>
    </span>
  );
};

export default DisplayOnlyWidget;
