import { faCalendarAlt, faCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FormBorder from "lib/theme/components/FormBorder";
import { DateTime } from "luxon";
import Link from "next/link";
import { graphql, useFragment } from "react-relay";
import { ReportDueIndicator_formChange$key } from "__generated__/ReportDueIndicator_formChange.graphql";

interface Props {
  /**
   * The relay fragment
   */
  reportDueFormChange: ReportDueIndicator_formChange$key;
  /**
   * The title of the link to display in this component.
   * e.g. "Quarterly Report" to display "Quarterly Report <reportIndex>"
   */
  reportTitle: string;
}

const ReportDueIndicator: React.FC<Props> = ({
  reportDueFormChange,
  reportTitle,
}) => {
  const formChange = useFragment(
    graphql`
      fragment ReportDueIndicator_formChange on FormChange {
        id
        reportingRequirement: asReportingRequirement {
          reportDueDate
          reportingRequirementIndex
        }
      }
    `,
    reportDueFormChange
  );

  const reportingRequirement = formChange?.reportingRequirement;
  const hasValidReportDueDate = reportingRequirement?.reportDueDate;

  // We return a negative value if report is overdue
  const reportDueIn =
    hasValidReportDueDate &&
    DateTime.fromISO(reportingRequirement.reportDueDate).diff(
      // Current date without time information
      DateTime.fromISO(DateTime.now().toISODate()),
      "days"
    );
  const overdue = reportDueIn?.days < 0;

  return (
    <>
      <FormBorder title="Next report due">
        <div className="container">
          <div className="icon calendar">
            <FontAwesomeIcon
              icon={faCalendarAlt}
              size="2x"
              style={{ marginTop: "0.1em" }}
            />
          </div>
          <div className="reportDueDateContainer">
            <div>
              {hasValidReportDueDate ? (
                <>
                  <b>
                    {DateTime.fromISO(
                      reportingRequirement.reportDueDate
                    ).toLocaleString(DateTime.DATE_MED)}
                  </b>{" "}
                  <Link href={`#form-${formChange.id}`}>
                    {`${reportTitle} ${reportingRequirement.reportingRequirementIndex}`}
                  </Link>
                </>
              ) : (
                <b>No reports due</b>
              )}
            </div>

            <div className="reportDueInContainer">
              <div className="icon dot">
                <FontAwesomeIcon
                  className="icon"
                  icon={faCircle}
                  size="xs"
                  color={overdue ? "red" : "green"}
                />
              </div>
              <div>
                {hasValidReportDueDate ? (
                  <>
                    {overdue ? "Overdue by " : "Due in "}
                    <b>{Math.floor(Math.abs(reportDueIn.days))} day(s)</b>
                  </>
                ) : (
                  "-"
                )}
              </div>
            </div>
          </div>
        </div>
      </FormBorder>

      <style jsx>{`
        .icon {
          margin-right: 1em;
        }
        .icon.dot {
          margin-top: -0.1em;
        }
        .container {
          display: flex;
          align-items: flex-start;
        }
        .reportDueDateContainer {
          display: flex;
          flex-direction: column;
        }
        .reportDueInContainer {
          display: flex;
          flex-direction: row;
          margin-top: 0.25em;
        }
      `}</style>
    </>
  );
};

export default ReportDueIndicator;
