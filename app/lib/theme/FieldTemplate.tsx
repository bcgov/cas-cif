import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { FieldTemplateProps } from "@rjsf/core";
import FieldLabel from "./widgets/FieldLabel";

const FieldTemplate: React.FC<FieldTemplateProps> = ({
  children,
  errors,
  help,
  rawErrors,
  label,
  displayLabel,
  required,
  id,
  uiSchema,
}) => {
  return (
    <div>
      {displayLabel && (
        <FieldLabel
          label={label}
          required={required}
          htmlFor={id}
          uiSchema={uiSchema}
        />
      )}
      {help}
      {children}

      <div className="error-div">
        {rawErrors && rawErrors.length > 0 ? (
          <>
            <FontAwesomeIcon
              className="error-icon"
              icon={faExclamationTriangle}
            />
            {errors}
          </>
        ) : null}
      </div>

      <style jsx>{`
        div:not(:last-child) {
          margin-bottom: 1em;
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
      `}</style>
    </div>
  );
};

export default FieldTemplate;
