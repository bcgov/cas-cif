/* eslint-disable relay/must-colocate-fragment-spreads*/
import { Checkbox } from "@button-inc/bcgov-theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { IFormItem, IIndexedFormConfiguration } from "data/formPages/types";

export interface CollapsibleFormWidgetProps {
  title: string;
  formItems: IFormItem<IIndexedFormConfiguration>[];
  projectRevision: any;
}

const collapsibleFormWidgetFragment = graphql`
  fragment CollapsibleFormWidget_projectRevision on ProjectRevision {
    ...ProjectFormSummary_projectRevision
    ...ProjectContactFormSummary_projectRevision
    ...ProjectManagerFormSummary_projectRevision
    ...ProjectQuarterlyReportFormSummary_projectRevision
    ...ProjectAnnualReportFormSummary_projectRevision
    ...ProjectMilestoneReportFormSummary_projectRevision
    ...ProjectFundingAgreementFormSummary_projectRevision
    ...ProjectEmissionIntensityReportFormSummary_projectRevision
    ...ProjectSummaryReportFormSummary_projectRevision
  }
`;

const CollapsibleFormWidget: React.FC<CollapsibleFormWidgetProps> = ({
  title,
  formItems,
  projectRevision,
}) => {
  const [hasDiff, setHasDiff] = useState(false);
  const [isOpen, setIsOpen] = useState(true); //This has to be true to start with, otherwise it will prevent the children from rendering
  const cursorStyle = hasDiff ? "pointer" : "default";
  const query = useFragment(collapsibleFormWidgetFragment, projectRevision);

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
                  isOnAmendmentsAndOtherRevisionsPage={true}
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
