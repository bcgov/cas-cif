import FieldLabel from "lib/theme/widgets/FieldLabel";
import { Button } from "@button-inc/bcgov-theme";
import { getLocaleFormattedDate } from "lib/theme/getLocaleFormattedDate";
import { generateQuarterlyReportsMutation$variables } from "__generated__/generateQuarterlyReportsMutation.graphql";
import { generateReportsMutation$variables } from "__generated__/generateReportsMutation.graphql";

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
  readonly: boolean;
  mutationFunction: (args: {
    variables:
      | generateQuarterlyReportsMutation$variables
      | generateReportsMutation$variables;
  }) => void;
  isGenerating: boolean;
}

const ReportGenerator: React.FC<Props> = ({
  revisionId,
  reportType,
  startDateObject,
  endDateObject,
  readonly,
  mutationFunction,
  isGenerating,
}) => {
  const reportGeneratorInput = {
    revisionId,
    startDate: startDateObject.date,
    endDate: endDateObject.date,
  };

  // TODO: After implementing report generation for annual reports, remove this and pass the whole object to the mutation function
  if (reportType === "Annual") {
    Object.assign(reportGeneratorInput, { reportType });
  }

  return (
    <div className="reportGenerator">
      {!readonly && <h3>Generate reports</h3>}
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
      {!readonly && (
        <Button
          variant="secondary"
          onClick={() =>
            mutationFunction({
              variables: {
                input: {
                  ...reportGeneratorInput,
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
