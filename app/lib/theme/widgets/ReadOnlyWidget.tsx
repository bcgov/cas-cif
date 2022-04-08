import { WidgetProps } from "@rjsf/core";
const ReadOnlyWidget: React.FC<WidgetProps> = ({ label, value, options }) => {
  return (
    <>
      {/* Individual contacts shouldn't display the label because they're grouped as either primary or secondary contacts. */}
      {label === "Contact" ? (
        <></>
      ) : (
        // Some of the uiSchemas that use this widget have the label text in the label prop; others have it in options.title. Similarly, some uiSchemas have the value in the value prop; others in options.text.
        <dt>{options.title ? options.title : label}</dt>
      )}

      <dd>
        {options.text ? options.text : value ? value : <em>Not added</em>}
      </dd>
    </>
  );
};

export default ReadOnlyWidget;
