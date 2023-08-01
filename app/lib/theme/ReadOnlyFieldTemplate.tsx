import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FieldTemplateProps } from "@rjsf/core";
import FieldLabel from "./widgets/FieldLabel";

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  children,
  errors,
  rawErrors,
  label,
  displayLabel,
  required,
  id,
  uiSchema,
}) => {
  const isAdjustableCalculatedValueWidget =
    uiSchema?.["ui:widget"] &&
    uiSchema["ui:widget"] === "AdjustableCalculatedValueWidget";

  return (
    <div>
      <div
        className={
          isAdjustableCalculatedValueWidget
            ? "adjustable-calculated-value-widget"
            : "definition-container"
        }
      >
        {displayLabel && (
          <FieldLabel
            label={label}
            required={required}
            htmlFor={id}
            tagName="dt"
            uiSchema={uiSchema}
          />
        )}
        {children}
      </div>
      {rawErrors && rawErrors.length > 0 ? (
        <div className="error-div">
          <FontAwesomeIcon
            className="error-icon"
            icon={faExclamationTriangle}
          />
          {errors}
        </div>
      ) : null}

      <style jsx>{`
        div.definition-container {
          display: flex;
        }
        div:not(:last-child) {
          margin-bottom: 0.5em;
        }
        div :global(.error-icon) {
          color: #cd2026;
        }
        div .error-div {
          height: 1.5rem;
          display: flex;
          padding-top: 10px;
        }
        div :global(ul.error-detail) {
          padding: 0;
          list-style: none;
          margin-left: 0.5rem;
        }
        div :global(li.text-danger) {
          color: #cd2026 !important;
        }
        div :global(.radio > label) {
          font-weight: normal;
        }
        div :global(input[type="radio"]) {
          margin-right: 1em;
        }
      `}</style>
    </div>
  );
};

export default FieldTemplate;
