import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getBadgeForIndividualReportStatus } from "lib/helpers/reportStatusHelpers";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { CollapsibleReport_reportingRequirement$key } from "__generated__/CollapsibleReport_reportingRequirement.graphql";

interface Props {
  title: string;
  startOpen?: boolean;
  reportingRequirement: CollapsibleReport_reportingRequirement$key;
}

const CollapsibleReport: React.FC<Props> = ({
  title,
  startOpen,
  reportingRequirement,
  children,
}) => {
  const data = useFragment(
    graphql`
      fragment CollapsibleReport_reportingRequirement on ReportingRequirement {
        reportDueDate
        submittedDate
      }
    `,
    reportingRequirement
  );

  // By default, start with the component open if the submittedDate is empty
  const [isOpen, setIsOpen] = useState(
    startOpen !== undefined ? startOpen : !data.submittedDate
  );

  return (
    <>
      <div className="reportContainer">
        <header className="reportHeader" onClick={() => setIsOpen(!isOpen)}>
          <h3>{title}</h3>
          <div className="reportStatus">
            {getBadgeForIndividualReportStatus(
              data.reportDueDate,
              data.submittedDate
            )}
          </div>
          <div className="toggleIcon">
            <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
          </div>
        </header>
        {/* Rendering hidden children is necessary in case they contain form elements with validation */}
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
          .reportStatus {
            margin-left: 1em;
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
