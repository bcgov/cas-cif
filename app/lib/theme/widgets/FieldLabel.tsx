import ContextualHelp from "./ContextualHelp";

interface Props {
  label: string;
  required: boolean;
  htmlFor: string;
  tagName?: "label" | "dt";
  uiSchema?: any;
}

const FieldLabel: React.FC<Props> = ({
  label,
  required,
  htmlFor,
  tagName = "label",
  uiSchema,
}) => {
  if (!label) {
    return null;
  }

  // Show the tooltip if the uiSchema has a tooltip object
  const ContextualHelpWidget = () => {
    const tooltipObj = uiSchema?.["ui:tooltip"];
    if (
      !tooltipObj ||
      typeof tooltipObj !== "object" ||
      (typeof tooltipObj === "object" && Array.isArray(tooltipObj))
    )
      return null;
    return <ContextualHelp {...tooltipObj} label={label} />;
  };

  const displayedLabel = uiSchema?.hideOptional
    ? label
    : label + (required ? "" : " (optional)") + " ";

  if (tagName === "label")
    return (
      <label htmlFor={htmlFor}>
        {displayedLabel}
        <ContextualHelpWidget />
      </label>
    );

  return (
    <>
      <dt>
        {displayedLabel}
        <ContextualHelpWidget />
      </dt>
      <style jsx>{`
        dt {
          margin-right: 1rem;
        }
      `}</style>
    </>
  );
};

export default FieldLabel;
