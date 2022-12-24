import { Checkbox } from "@button-inc/bcgov-theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

import { IFormItem, IIndexedFormConfiguration } from "data/formPages/types";

export interface CollapsibleFormWidgetProps {
  title: string;
  formItems: IFormItem<IIndexedFormConfiguration>[];
  query: any;
}

const CollapsibleFormWidget: React.FC<CollapsibleFormWidgetProps> = ({
  title,
  formItems,
  query,
}) => {
  const [hasDiff, setHasDiff] = useState(true);
  const [isOpen, setIsOpen] = useState(true);
  const cursorStyle = hasDiff ? "pointer" : "default";

  return (
    <li>
      <div className="formCheckboxWrapper" onClick={() => setIsOpen(!isOpen)}>
        <Checkbox
          disabled={true}
          id={title}
          label={title}
          name={title}
          size="large"
          checked={hasDiff}
        />
        {hasDiff && (
          <span>
            <FontAwesomeIcon icon={isOpen ? faCaretDown : faCaretUp} />
          </span>
        )}
      </div>
      {isOpen && (
        <ul>
          {formItems.map((item, formItemsIndex) => {
            const ViewComponent = item.formConfiguration.viewComponent;
            return (
              <li key={formItemsIndex}>
                <ViewComponent
                  projectRevision={query}
                  viewOnly={false}
                  isOnProjectRevisionViewPage={true}
                  setHasDiff={setHasDiff}
                />
              </li>
            );
          })}
        </ul>
      )}
      <style jsx>{`
        .formCheckboxWrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: ${cursorStyle};
          margin-top: 1.5em;
        }
        li :global(.pg-checkbox-label) {
          cursor: ${cursorStyle};
        }
        ul {
          list-style: none;
        }
        ul li :global(.definition-container) {
          // need the specificity to override the default
          display: flex;
          flex-direction: row;
          align-items: baseline;
        }
        ul li :global(.contentSuffix) {
          font-size: 0.8em;
        }
        ul :global(h4) {
          font-size: 0.8em;
          margin-bottom: 1em;
          text-decoration: underline;
        }
      `}</style>
    </li>
  );
};

export default CollapsibleFormWidget;
