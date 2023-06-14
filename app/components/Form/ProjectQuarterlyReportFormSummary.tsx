import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { reportingRequirementUiSchema } from "data/jsonSchemaForm/projectReportingRequirementUiSchema";
import { ProjectQuarterlyReportFormSummary_projectRevision$key } from "__generated__/ProjectQuarterlyReportFormSummary_projectRevision.graphql";
import { getFilteredSchema } from "lib/theme/schemaFilteringHelpers";
import { SummaryFormProps } from "data/formPages/types";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

// Set custom rjsf fields to display diffs
const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectQuarterlyReportFormSummary_projectRevision$key> {}

const ProjectQuarterlyReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const {
    summaryProjectQuarterlyReportFormChanges,
    isFirstRevision,
    latestCommittedProjectQuarterlyReportFormChanges,
  } = useFragment(
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
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        latestCommittedProjectQuarterlyReportFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Quarterly"
        ) {
          edges {
            node {
              id
              newFormData
            }
          }
        }
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the quarterly report page)
  const renderDiff = !isFirstRevision && !viewOnly;

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
            formSchema: quarterlyReport.formByJsonSchemaName.jsonSchema.schema,
            formData: quarterlyReport.newFormData,
          }
        : getFilteredSchema(
            quarterlyReport.formByJsonSchemaName.jsonSchema
              .schema as JSONSchema7,
            quarterlyReport
          );

      if (
        isOnAmendmentsAndOtherRevisionsPage &&
        quarterlyReport?.isPristine &&
        quarterlyReport.operation !== "ARCHIVE"
      )
        return null;

      const latestCommittedData =
        latestCommittedProjectQuarterlyReportFormChanges?.edges?.find(
          ({ node }) =>
            node.newFormData.reportingRequirementIndex ===
            quarterlyReport.newFormData.reportingRequirementIndex
        )?.node?.newFormData;

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Quarterly Report {index + 1}</h4>
          </header>
          {/* Show this part if none of the quarterly reports' form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            quarterlyReport.operation !== "ARCHIVE" && (
              <FormNotAddedOrUpdated
                isFirstRevision={isFirstRevision}
                formTitle="Quarterly Report"
              />
            )}
          {/* Show this part if the whole quarterly report has been removed */}
          {renderDiff && quarterlyReport.operation === "ARCHIVE" ? (
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Quarterly Report"
            />
          ) : (
            <FormBase
              liveValidate
              key={`form-${quarterlyReport.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={formSchema as JSONSchema7}
              uiSchema={reportingRequirementUiSchema}
              formData={formData}
              formContext={{
                operation: quarterlyReport.operation,
                oldData:
                  quarterlyReport.formChangeByPreviousFormChangeId?.newFormData,
                latestCommittedData,
                isAmendmentsAndOtherRevisionsSpecific:
                  isOnAmendmentsAndOtherRevisionsPage,
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
  }, [
    isFirstRevision,
    isOnAmendmentsAndOtherRevisionsPage,
    latestCommittedProjectQuarterlyReportFormChanges?.edges,
    renderDiff,
    sortedQuarterlyReports,
  ]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Project Quarterly Reports</h3>
      )}
      {quarterlyReportFormChanges.length < 1 && viewOnly && (
        <FormNotAddedOrUpdated
          isFirstRevision={true} //setting this to true so that the text is "Quarterly Reports not added"
          formTitle="Quarterly Reports"
        />
      )}
      {(allFormChangesPristine || quarterlyReportFormChanges.length < 1) &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Quarterly Reports"
        />
      ) : (
        quarterlyReportsJSX
      )}
    </>
  );
};

export default ProjectQuarterlyReportFormSummary;
