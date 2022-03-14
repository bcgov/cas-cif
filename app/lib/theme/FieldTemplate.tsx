import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const FieldTemplate = ({ children, errors, help, rawErrors }) => {
  return (
    <>
      <div>
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
        {help}
      </div>
      <style jsx>{`
        div:not(:last-child) {
          margin-bottom: 1em;
        }
        :global(.error-icon) {
          color: #cd2026;
        }
        :global(.error-div) {
          height: 1.5rem;
          display: flex;
          padding-top: 10px;
        }
        :global(ul.error-detail) {
          padding: 0;
          list-style: none;
          margin-left: 0.5rem;
        }
        :global(li.text-danger) {
          color: #cd2026 !important;
        }
      `}</style>
    </>
  );
};

export default FieldTemplate;
