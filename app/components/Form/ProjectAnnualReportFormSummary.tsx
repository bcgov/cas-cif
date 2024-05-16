import { utils } from "@rjsf/core";
import { reportingRequirementUiSchema } from "data/jsonSchemaForm/projectReportingRequirementUiSchema";
import { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { getFilteredSchema } from "lib/theme/schemaFilteringHelpers";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportFormSummary_projectRevision$key } from "__generated__/ProjectAnnualReportFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { SummaryFormProps } from "data/formPages/types";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectAnnualReportFormSummary_projectRevision$key> {}

const ProjectAnnualReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const {
    summaryAnnualReportFormChanges,
    isFirstRevision,
    latestCommittedAnnualReportFormChanges,
  } = useFragment(
    graphql`
      fragment ProjectAnnualReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        id
        summaryAnnualReportFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Annual"
        ) {
          edges {
            node {
              id
              isPristine
              newFormData
              operation
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        latestCommittedAnnualReportFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Annual"
        ) {
          edges {
            node {
              newFormData
            }
          }
        }
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the annual reports page)
  const renderDiff = !isFirstRevision && !viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived reports
  let annualReportFormChanges = summaryAnnualReportFormChanges.edges;
  if (!renderDiff)
    annualReportFormChanges = summaryAnnualReportFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  // Sorting the annual report form changes by the reporting requirement index
  const [sortedAnnualReports] = useMemo(() => {
    const filteredReports = annualReportFormChanges.map(({ node }) => node);

    filteredReports.sort(
      (a, b) =>
        a.newFormData.reportingRequirementIndex -
        b.newFormData.reportingRequirementIndex
    );

    return [filteredReports];
  }, [annualReportFormChanges]);

  let latestCommittedReports = latestCommittedAnnualReportFormChanges.edges;
  const latestCommittedReportMap = useMemo(() => {
    const filteredReports = latestCommittedReports.map(({ node }) => node);

    const reportMap = filteredReports.reduce(
      (reports, current) => (
        (reports[current.newFormData.reportingRequirementIndex] = current),
        reports
      ),
      {}
    );

    return reportMap;
  }, [latestCommittedReports]);

  const allFormChangesPristine = useMemo(
    () =>
      !annualReportFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [annualReportFormChanges]
  );

  const annualReportsJSX = useMemo(() => {
    return sortedAnnualReports.map((annualReport, index) => {
      if (!annualReport) return;
      // Set the formSchema and formData based on showing the diff or not
      const { formSchema, formData } = !renderDiff
        ? {
            formSchema: annualReport.formByJsonSchemaName.jsonSchema.schema,
            formData: annualReport.newFormData,
          }
        : getFilteredSchema(
            annualReport.formByJsonSchemaName.jsonSchema.schema as JSONSchema7,
            annualReport,
            latestCommittedReportMap[
              annualReport.newFormData.reportingRequirementIndex
            ]
          );

      if (
        isOnAmendmentsAndOtherRevisionsPage &&
        annualReport.isPristine &&
        annualReport.operation !== "ARCHIVE"
      )
        return null;

      const latestCommittedData =
        latestCommittedAnnualReportFormChanges?.edges?.find(
          ({ node }) =>
            node.newFormData.reportingRequirementIndex ===
            annualReport.newFormData.reportingRequirementIndex
        )?.node?.newFormData;

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Annual Report {index + 1}</h4>
          </header>
          {/* Show this part if none of Annual report form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            annualReport.operation !== "ARCHIVE" && (
              <FormNotAddedOrUpdated
                isFirstRevision={isFirstRevision}
                formTitle="Annual Report"
              />
            )}
          {/* Show this part if the whole Annual report has been removed */}
          {renderDiff && annualReport.operation === "ARCHIVE" ? (
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Annual Report"
            />
          ) : (
            <FormBase
              liveValidate
              key={`form-${annualReport.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={formSchema as JSONSchema7}
              formData={formData}
              uiSchema={reportingRequirementUiSchema}
              formContext={{
                operation: annualReport.operation,
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
    renderDiff,
    sortedAnnualReports,
  ]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Annual Reports</h3>}
      {annualReportFormChanges.length < 1 && viewOnly && (
        <dd>
          <em>No Annual Reports</em>
        </dd>
      )}
      {allFormChangesPristine &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Annual Reports"
        />
      ) : (
        annualReportsJSX
      )}
    </>
  );
};

export default ProjectAnnualReportFormSummary;
