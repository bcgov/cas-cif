import { WidgetProps } from "@rjsf/core";
const ReadOnlyWidget: React.FC<WidgetProps> = ({ label, value, options }) => {
  return (
    <>
      {/* Some of the uiSchemas that use this widget have the label text in the label prop; others have it in options.title. Similarly, some uiSchemas have the value in the value prop; others in options.text. */}
      <dt>{options.title ?? label}</dt>

      <dd>{options.text ?? value ?? <em>Not added</em>}</dd>
    </>
  );
};

export default ReadOnlyWidget;
