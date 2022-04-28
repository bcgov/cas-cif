import { faSync, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  isSaved: boolean;
}

const SavingIndicator: React.FC<Props> = ({ isSaved }) => {
  return (
    <div>
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
            padding: 0.5rem;
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
