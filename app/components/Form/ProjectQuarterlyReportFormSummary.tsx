import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { ProjectQuarterlyReportFormSummary_projectRevision$key } from "__generated__/ProjectQuarterlyReportFormSummary_projectRevision.graphql";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import { quarterlyReportUiSchema } from "./ProjectQuarterlyReportForm";

const { fields } = utils.getDefaultRegistry();

// Set custom rjsf fields to display diffs
const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectQuarterlyReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectQuarterlyReportFormSummary: React.FC<Props> = (props) => {
  const { summaryProjectQuarterlyReportFormChanges, isFirstRevision } =
    useFragment(
      graphql`
        fragment ProjectQuarterlyReportFormSummary_projectRevision on ProjectRevision {
          isFirstRevision
          summaryProjectQuarterlyReportFormChanges: formChangesFor(
            formDataTableName: "reporting_requirement"
            reportType: "Quarterly"
          ) {
            edges {
              node {
                id
                isPristine
                newFormData
                operation
                formChangeByPreviousFormChangeId {
                  newFormData
                }
              }
            }
          }
        }
      `,
      props.projectRevision
    );

  // Show diff if it is not the first revision and not view only (rendered from the quarterly report page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived quarterly reports
  let quarterlyReportFormChanges =
    summaryProjectQuarterlyReportFormChanges.edges;
  if (!renderDiff)
    quarterlyReportFormChanges =
      summaryProjectQuarterlyReportFormChanges.edges.filter(
        ({ node }) => node.operation !== "ARCHIVE"
      );

  // Sorting the quarterly report form changes by the reporting requirement index
  const [sortedQuarterlyReports] = useMemo(() => {
    const filteredReports = quarterlyReportFormChanges.map(({ node }) => node);

    filteredReports.sort(
      (a, b) =>
        a.newFormData.reportingRequirementIndex -
        b.newFormData.reportingRequirementIndex
    );

    return [filteredReports];
  }, [quarterlyReportFormChanges]);

  // Defines if all quarterly reports are pristine
  const allFormChangesPristine = useMemo(
    () =>
      !quarterlyReportFormChanges.some(
        ({ node }) => node?.isPristine === false || node?.isPristine === null
      ),
    [quarterlyReportFormChanges]
  );

  const quarterlyReportsJSX = useMemo(() => {
    return sortedQuarterlyReports.map((quarterlyReport, index) => {
      if (!quarterlyReport) return;

      // Set the formSchema and formData based on showing the diff or not
      const { formSchema, formData } = !renderDiff
        ? {
            formSchema: projectReportingRequirementSchema,
            formData: quarterlyReport.newFormData,
          }
        : getFilteredSchema(
            projectReportingRequirementSchema as JSONSchema7,
            quarterlyReport
          );

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Quarterly Report {index + 1}</h4>
          </header>
          {/* Show this part if none of the quarterly reports' form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            quarterlyReport.operation !== "ARCHIVE" && (
              <em>Quarterly report not updated</em>
            )}
          {/* Show this part if the whole quarterly report has been removed */}
          {renderDiff && quarterlyReport.operation === "ARCHIVE" ? (
            <em className="diffOld">Quarterly Report Removed</em>
          ) : (
            <FormBase
              liveValidate
              key={`form-${quarterlyReport.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={formSchema as JSONSchema7}
              uiSchema={quarterlyReportUiSchema}
              formData={formData}
              formContext={{
                operation: quarterlyReport.operation,
                oldData:
                  quarterlyReport.formChangeByPreviousFormChangeId?.newFormData,
              }}
            />
          )}
          <style jsx>{`
            .reportContainer {
              margin-bottom: 1em;
            }
          `}</style>
        </div>
      );
    });
  }, [sortedQuarterlyReports, renderDiff]);

  return (
    <>
      <h3>Project Quarterly Reports</h3>
      {quarterlyReportFormChanges.length < 1 && props.viewOnly && (
        <dd>
          <em>No Quarterly Reports</em>
        </dd>
      )}
      {(allFormChangesPristine || quarterlyReportFormChanges.length < 1) &&
      !props.viewOnly ? (
        <dd>
          <em>Quarterly reports not {isFirstRevision ? "added" : "updated"}</em>
        </dd>
      ) : (
        quarterlyReportsJSX
      )}
    </>
  );
};

export default ProjectQuarterlyReportFormSummary;
