import FieldLabel from "lib/theme/widgets/FieldLabel";
import { Button } from "@button-inc/bcgov-theme";
import { getLocaleFormattedDate } from "lib/theme/getLocaleFormattedDate";
import { generateQuarterlyReportsMutation$variables } from "__generated__/generateQuarterlyReportsMutation.graphql";
import { generateAnnualReportsMutation$variables } from "__generated__/generateAnnualReportsMutation.graphql";

type DateFieldObject = {
  id: string;
  label: string;
  inputName: string;
  date: string;
};

interface Props {
  revisionId: number;
  reportType: string;
  startDateObject: DateFieldObject;
  endDateObject: DateFieldObject;
  hasReports: boolean;
  mutationFunction: (args: {
    variables:
      | generateQuarterlyReportsMutation$variables
      | generateAnnualReportsMutation$variables;
  }) => void;
  isGenerating: boolean;
}

const ReportGenerator: React.FC<Props> = ({
  revisionId,
  reportType,
  startDateObject,
  endDateObject,
  hasReports,
  mutationFunction,
  isGenerating,
}) => {
  return (
    <div className="reportGenerator">
      {!hasReports && <h3>Generate reports</h3>}
      <dl key={startDateObject.id}>
        <FieldLabel
          label={startDateObject.label}
          required={true}
          htmlFor={`form-${startDateObject.id}_${startDateObject.inputName}`}
          tagName="dt"
        />
        <dd>
          {startDateObject.date ? (
            getLocaleFormattedDate(startDateObject.date)
          ) : (
            <em>-</em>
          )}
        </dd>
      </dl>
      <dl key={endDateObject.id}>
        <FieldLabel
          label={endDateObject.label}
          required={true}
          htmlFor={`form-${endDateObject.id}_${endDateObject.inputName}`}
          tagName="dt"
        />
        <dd>
          {endDateObject.date ? (
            getLocaleFormattedDate(endDateObject.date)
          ) : (
            <em>-</em>
          )}
        </dd>
      </dl>
      {!hasReports && (
        <Button
          variant="secondary"
          onClick={() =>
            mutationFunction({
              variables: {
                input: {
                  revisionId,
                  startDate: startDateObject.date,
                  endDate: endDateObject.date,
                },
              },
            })
          }
          disabled={
            isGenerating || !startDateObject.date || !endDateObject.date
          }
        >
          Generate {reportType.toLowerCase()} reports
        </Button>
      )}
      <style jsx>{`
        .reportGenerator {
          border-bottom: 1px solid black;
          margin-bottom: 1em;
          padding-bottom: 1em;
        }
      `}</style>
    </div>
  );
};

export default ReportGenerator;
