import { utils } from "@rjsf/core";
import {
  projectReportingRequirementSchema,
  reportingRequirementUiSchema,
} from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportFormSummary_projectRevision$key } from "__generated__/ProjectAnnualReportFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { SummaryFormProps } from "data/formPages/types";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props extends Omit<SummaryFormProps, "projectRevision"> {
  projectRevision: ProjectAnnualReportFormSummary_projectRevision$key;
}

const ProjectAnnualReportFormSummary: React.FC<Props> = (props) => {
  const { summaryAnnualReportFormChanges, isFirstRevision } = useFragment(
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

  // Show diff if it is not the first revision and not view only (rendered from the annual reports page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  const isOnProjectRevisionViewPage = props.isOnProjectRevisionViewPage;

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
            formSchema: projectReportingRequirementSchema,
            formData: annualReport.newFormData,
          }
        : getFilteredSchema(
            projectReportingRequirementSchema as JSONSchema7,
            annualReport
          );

      if (
        isOnProjectRevisionViewPage &&
        annualReport?.isPristine &&
        annualReport.operation !== "ARCHIVE"
      )
        return null;

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Annual Report {index + 1}</h4>
          </header>
          {/* Show this part if none of Annual report form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            annualReport.operation !== "ARCHIVE" && (
              <em>Annual report not updated</em>
            )}
          {/* Show this part if the whole Annual report has been removed */}
          {renderDiff && annualReport.operation === "ARCHIVE" ? (
            <em
              className={
                isOnProjectRevisionViewPage
                  ? "diffAmendmentsAndOtherRevisionsOld"
                  : "diffReviewAndSubmitInformationOld"
              }
            >
              Annual report removed
            </em>
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
                oldData:
                  annualReport.formChangeByPreviousFormChangeId?.newFormData,
                isRevisionSpecific: isOnProjectRevisionViewPage,
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
  }, [sortedAnnualReports, renderDiff, isOnProjectRevisionViewPage]);

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => props.setHasDiff && props.setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, props]
  );

  return (
    <>
      {!isOnProjectRevisionViewPage && <h3>Project Annual Reports</h3>}
      {annualReportFormChanges.length < 1 && props.viewOnly && (
        <dd>
          <em>No Annual Reports</em>
        </dd>
      )}
      {allFormChangesPristine &&
      !props.viewOnly &&
      !isOnProjectRevisionViewPage ? (
        <p>
          <em>
            Project Annual Reports not {isFirstRevision ? "added" : "updated"}
          </em>
        </p>
      ) : (
        annualReportsJSX
      )}
    </>
  );
};

export default ProjectAnnualReportFormSummary;
