import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface Props {
  title: string;
  startOpen?: boolean;
}

const CollapsibleReport: React.FC<Props> = ({
  title,
  startOpen = false,
  children,
}) => {
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <>
      <div className="reportContainer">
        <header className="reportHeader" onClick={() => setIsOpen(!isOpen)}>
          <h3>{title}</h3>
          <div className="toggleIcon">
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
          </div>
        </header>
        <div className={!isOpen && "closed"}>{children}</div>
      </div>
      <style jsx>
        {`
          .closed {
            display: none;
          }
          .reportContainer {
            border-top: 1px solid black;
          }
          .reportHeader {
            display: flex;
            flex-direction: row;
            cursor: pointer;
            padding-top: 1em;
          }
          .toggleIcon {
            margin-left: auto;
          }
        `}
      </style>
    </>
  );
};

export default CollapsibleReport;
