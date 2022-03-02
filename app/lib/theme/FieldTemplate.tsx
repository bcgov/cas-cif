import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const FieldTemplate = ({ children, errors, help, rawErrors }) => {
  return (
    <>
      <div>
        {children}
        {rawErrors ? (
          <div className={"error-div"}>
            <FontAwesomeIcon className="error-icon" icon={faExclamationTriangle} />
            {errors}
          </div>
        ) : (
          <div className={"error-div"}>
            <div>&nbsp;</div>
          </div>
        )}
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
          height: 5%;
          display: flex;
          padding-top: 10px;
        }
      `}</style>
    </>
  );
};

export default FieldTemplate;
