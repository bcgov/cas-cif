import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import StatusBadge from "components/StatusBadge";
import { DateTime } from "luxon";
import { useState } from "react";
import { graphql, useFragment } from "react-relay";
import { CollapsibleReport_reportingRequirement$key } from "__generated__/CollapsibleReport_reportingRequirement.graphql";

interface Props {
  title: string;
  startOpen?: boolean;
  reportingRequirement: CollapsibleReport_reportingRequirement$key;
}

const getBadgeForDates = (
  reportDueDateString: string,
  submittedDateString: string
) => {
  const parsedDueDate =
    reportDueDateString &&
    DateTime.fromISO(reportDueDateString, {
      setZone: true,
      locale: "en-CA",
    }).startOf("day");
  const parsedSubmittedDate =
    submittedDateString &&
    DateTime.fromISO(submittedDateString, {
      setZone: true,
      locale: "en-CA",
    }).startOf("day");

  if (parsedDueDate && parsedSubmittedDate) {
    {
      return (
        <StatusBadge
          variant="complete"
          label={`Complete (${parsedSubmittedDate.toLocaleString(
            DateTime.DATE_MED
          )})`}
        />
      );
    }
  } else if (parsedDueDate && !parsedSubmittedDate) {
    const dueIn = parsedDueDate.diff(
      // Current date without time information
      DateTime.now().setZone("America/Vancouver").startOf("day"),
      "days"
    ).days;

    return dueIn < 0 ? (
      <StatusBadge variant="late" />
    ) : (
      <StatusBadge variant="onTrack" />
    );
  } else {
    return null;
  }
};

const CollapsibleReport: React.FC<Props> = ({
  title,
  startOpen = false,
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
  const [isOpen, setIsOpen] = useState(startOpen);

  return (
    <>
      <div className="reportContainer">
        <header className="reportHeader" onClick={() => setIsOpen(!isOpen)}>
          <h3>{title}</h3>
          <div className="reportStatus">
            {getBadgeForDates(data.reportDueDate, data.submittedDate)}
          </div>
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
