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

  const displayedLabel = uiSchema?.hideOptional
    ? label
    : label + (required ? "" : " (optional)") + " ";

  if (tagName === "label")
    return <label htmlFor={htmlFor}>{displayedLabel}</label>;

  return (
    <>
      <dt>{displayedLabel}</dt>
      <style jsx>{`
        dt {
          margin-right: 1rem;
        }
      `}</style>
    </>
  );
};

export default FieldLabel;
