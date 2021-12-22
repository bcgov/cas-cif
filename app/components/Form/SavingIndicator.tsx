import { faSync, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  isSaved: boolean;
  lastEdited: Date;
}

const SavingIndicator: React.FC<Props> = ({ isSaved, lastEdited }) => {
  return (
    <div>
      <span className="last-edited">
        Last edited:{" "}
        {lastEdited.toLocaleString("en-CA", {
          timeZone: "America/Vancouver",
          dateStyle: "short",
        })}
      </span>
      <span>
        <FontAwesomeIcon icon={isSaved ? faCheck : faSync} />
        <span className="is-saved">
          {isSaved ? "Changes saved." : "Saving changes..."}
        </span>
      </span>
      <style jsx>
        {`
          div {
            display: inline-flex;
            justify-content: flex-end;
            align-items: baseline;
            border: solid 1px;
            border-radius: 4px;
            padding: 0.5rem;
          }

          .last-edited {
            margin-right: 1rem;
          }

          .is-saved {
            margin-left: 0.5rem;
          }
        `}
      </style>
    </div>
  );
};

export default SavingIndicator;
