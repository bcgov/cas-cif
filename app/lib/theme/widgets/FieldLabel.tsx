interface Props {
  label: string;
  required: boolean;
  htmlFor: string;
  tagName?: "label" | "dt";
}

const FieldLabel: React.FC<Props> = ({
  label,
  required,
  htmlFor,
  tagName = "label",
}) => {
  if (!label) {
    return null;
  }

  const displayedLabel =
    label === "GHG Emission Intensity Performance"
      ? "GHG Emission Intensity Performance"
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
