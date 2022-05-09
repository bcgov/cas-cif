import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useState } from "react";

interface Props {
  defaultExpandedState: boolean;
  listItemNumber: string;
  listItemName: string;
  listItemMode?: string;
  formListItemArray: Array<{
    stepName: string;
    linkUrl: { pathname: string; query: { projectRevision: string } };
    formTitle: string;
    formStatus: string | JSX.Element;
  }>;
  currentStep: string;
  mode: string;
}

const TaskListItem: React.FC<Props> = ({
  defaultExpandedState,
  listItemNumber,
  listItemName,
  listItemMode,
  formListItemArray,
  currentStep,
  mode,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpandedState);
  const toggleCustomAccordion = () => setIsExpanded(!isExpanded);

  const getFormListItem = ({
    index,
    stepName,
    linkUrl,
    formTitle,
    formStatus,
  }) => {
    return (
      <li
        aria-current={currentStep === stepName ? "step" : false}
        className="bordered"
        key={index}
      >
        <Link href={linkUrl}>
          <a>
            {mode === "view" || stepName === "summary"
              ? formTitle
              : `${
                  mode === "update" ? "Edit" : "Add"
                } ${formTitle.toLowerCase()}`}
          </a>
        </Link>
        {mode !== "view" && <div className="status">{formStatus}</div>}

        <style jsx>{`
          li {
            text-indent: 15px;
            margin-bottom: 0;
            display: flex;
            justify-content: space-between;
          }
          li[aria-current="step"],
          li[aria-current="step"] div {
            background-color: #fafafc;
          }

          .bordered {
            border-bottom: 1px solid #d1d1d1;
            padding: 10px 0 10px 0;
          }

          .status {
            text-align: right;
            padding-right: 5px;
          }
        `}</style>
      </li>
    );
  };

  return (
    <li>
      <h3 className="customAccordion" onClick={toggleCustomAccordion}>
        {listItemNumber}. {listItemName} {listItemMode}{" "}
        <span>
          <FontAwesomeIcon icon={isExpanded ? faCaretDown : faCaretUp} />
        </span>
      </h3>
      {isExpanded && (
        <ul>
          {formListItemArray.map((formListItem, index) =>
            getFormListItem({ index, ...formListItem })
          )}
        </ul>
      )}
      <style jsx>{`
        h3 {
          font-size: 1rem;
          line-height: 1;
          border-bottom: 1px solid #d1d1d1;
          text-indent: 15px;
          padding: 10px 0 10px 0;
          margin: 0;
        }
        ul {
          list-style: none;
          margin: 0;
        }
        li {
          text-indent: 15px;
          margin-bottom: 0;
        }
        ul > li {
          display: flex;
          justify-content: space-between;
        }
        .customAccordion {
          //pointer cursor on project details heading
          cursor: pointer;
          display: flex;
          justify-content: space-between;
        }
        .customAccordion span {
          padding-right: 5px;
        }
      `}</style>
    </li>
  );
};

export default TaskListItem;
