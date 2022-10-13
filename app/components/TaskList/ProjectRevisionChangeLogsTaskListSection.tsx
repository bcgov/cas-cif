import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getProjectRevisionChangeLogsPageRoute } from "routes/pageRoutes";

interface Props {
  projectRevisionId: string;
  defaultExpandedState: boolean;
  listItemName: string;
  children?: React.ReactNode;
}

const ProjectRevisionChangeLogsTaskListSection: React.FC<Props> = ({
  projectRevisionId,
  defaultExpandedState,
  listItemName,
  children,
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(defaultExpandedState);
  const toggleCustomAccordion = () => {
    router.push(getProjectRevisionChangeLogsPageRoute(projectRevisionId));
    setIsExpanded(!isExpanded);
  };
  useEffect(() => {
    setIsExpanded(defaultExpandedState);
  }, [defaultExpandedState]);

  return (
    <li>
      <h3 onClick={toggleCustomAccordion}>
        <button
          className="accordionTrigger"
          type="button"
          aria-expanded={isExpanded}
          aria-controls="child-section"
        >
          {listItemName}
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

export default ProjectRevisionChangeLogsTaskListSection;
