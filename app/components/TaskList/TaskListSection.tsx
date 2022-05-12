import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

interface Props {
  defaultExpandedState: boolean;
  listItemNumber: string;
  listItemName: string;
  listItemMode?: string;
  children: React.ReactNode;
}

const TaskListSection: React.FC<Props> = ({
  defaultExpandedState,
  listItemNumber,
  listItemName,
  listItemMode,
  children,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpandedState);
  const toggleCustomAccordion = () => setIsExpanded(!isExpanded);

  return (
    <li>
      <h3 onClick={toggleCustomAccordion}>
        <button
          className="accordionTrigger"
          type="button"
          aria-expanded={isExpanded}
          aria-controls="child-section"
        >
          {listItemNumber}. {listItemName} {listItemMode}
          <span>
            <span>
              <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretUp} />
            </span>
          </span>
        </button>
      </h3>
      {isExpanded && <ul id="child-section">{children}</ul>}
      <style jsx>{`
        li {
          text-indent: 15px;
          margin-bottom: 0;
        }
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          padding: 10px 0 10px 0;
          margin: 0;
          display: flex;
          justify-content: space-between;
        }
        h3,
        .accordionTrigger {
          cursor: pointer;
        }
        .accordionTrigger {
          width: 100%;
          // Remove the default button styles
          border: none;
          background: none;
          display: flex;
          justify-content: space-between;
          // This padding is to make the button outline looks better on focus
          padding: 0.2em 0.5em 0.2em 0.5em;
        }
        ul {
          list-style: none;
          margin: 0;
        }
      `}</style>
    </li>
  );
};

export default TaskListSection;
