import { useEffect, useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { ProjectMilestoneReportFormSummary_projectRevision$key } from "__generated__/ProjectMilestoneReportFormSummary_projectRevision.graphql";
import projectMilestoneUiSchema from "data/jsonSchemaForm/projectMilestoneUiSchema";
import { getSortedReports } from "./Functions/reportingRequirementFormChangeFunctions";
import { getMilestoneFilteredSchema } from "./Functions/getMilestoneFilteredSchema";
import { SummaryFormProps } from "data/formPages/types";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props
  extends SummaryFormProps<ProjectMilestoneReportFormSummary_projectRevision$key> {}

const ProjectMilestoneReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
}) => {
  const { summaryMilestoneFormChanges, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectMilestoneReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryMilestoneFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        ) @connection(key: "connection_summaryMilestoneFormChanges") {
          edges {
            # eslint-disable-next-line relay/unused-fields
            node {
              id
              # eslint-disable-next-line relay/unused-fields
              formDataRecordId
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
      }
    `,
    projectRevision
  );

  const renderDiff = !isFirstRevision && !viewOnly;

  // If we are showing the diff then we want to see archived records,
  // otherwise filter out the archived milestone reports
  const milestoneReportFormChanges = renderDiff
    ? summaryMilestoneFormChanges.edges
    : summaryMilestoneFormChanges.edges.filter(
        ({ node }) => node.operation !== "ARCHIVE"
      );

  // Sort consolidated milestone form change records
  const [sortedMilestoneReports] = useMemo(() => {
    return getSortedReports(milestoneReportFormChanges, true);
  }, [milestoneReportFormChanges]);

  const allFormChangesPristine = useMemo(
    () =>
      !milestoneReportFormChanges.some(
        (report) =>
          report?.node.isPristine === false || report?.node.isPristine === null
      ),
    [milestoneReportFormChanges]
  );

  const milestoneReportsJSX = useMemo(() => {
    return sortedMilestoneReports.map((milestoneReport, index) => {
      // Set the formSchema and formData based on showing the diff or not
      const milestoneFormDiffObject = renderDiff
        ? getMilestoneFilteredSchema(
            milestoneReport.formByJsonSchemaName.jsonSchema
              .schema as JSONSchema7,
            milestoneReport
          )
        : {
            formSchema: milestoneReport.formByJsonSchemaName.jsonSchema.schema,
            formData: milestoneReport.newFormData,
          };

      if (
        isOnAmendmentsAndOtherRevisionsPage &&
        milestoneReport?.isPristine &&
        milestoneReport.operation !== "ARCHIVE"
      )
        return null;

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Milestone Report {index + 1}</h4>
          </header>
          {/* Show this part if none of milestone report form properties have been updated */}
          {Object.keys(milestoneFormDiffObject.formSchema.properties).length ===
            0 &&
            milestoneReport.operation !== "ARCHIVE" && (
              <em>Milestone report not updated</em>
            )}

          {/* Show this part if the whole milestone report has been removed */}
          {renderDiff && milestoneReport.operation === "ARCHIVE" && (
            <em
              className={
                isOnAmendmentsAndOtherRevisionsPage
                  ? "diffAmendmentsAndOtherRevisionsOld"
                  : "diffReviewAndSubmitInformationOld"
              }
            >
              Milestone Report Removed
            </em>
          )}
          <FormBase
            key={`form-${milestoneReport.id}`}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={milestoneFormDiffObject.formSchema as JSONSchema7}
            uiSchema={projectMilestoneUiSchema}
            formData={milestoneFormDiffObject.formData}
            formContext={{
              operation: milestoneReport.operation,
              oldData:
                milestoneReport.formChangeByPreviousFormChangeId?.newFormData,
              isAmendmentsAndOtherRevisionsSpecific:
                isOnAmendmentsAndOtherRevisionsPage,
            }}
          />

          <style jsx>{`
            div.reportContainer {
              padding-top: 1em;
            }
          `}</style>
        </div>
      );
    });
  }, [sortedMilestoneReports, renderDiff, isOnAmendmentsAndOtherRevisionsPage]);

  const milestoneReportsNotUpdated = useMemo(
    () => allFormChangesPristine || milestoneReportFormChanges.length < 1,
    [allFormChangesPristine, milestoneReportFormChanges.length]
  );

  // Update the hasDiff state in the CollapsibleFormWidget to define if the form has diffs to show
  useEffect(
    () => setHasDiff && setHasDiff(!milestoneReportsNotUpdated),
    [milestoneReportsNotUpdated, setHasDiff]
  );

  if (isOnAmendmentsAndOtherRevisionsPage && milestoneReportsNotUpdated)
    return null;

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && (
        <h3>Project Milestone Reports</h3>
      )}
      {milestoneReportFormChanges.length < 1 && viewOnly && (
        <dd>
          <em>No Milestone Reports</em>
        </dd>
      )}
      {(allFormChangesPristine || milestoneReportFormChanges.length < 1) &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <dd>
          <em>Milestone Reports not {isFirstRevision ? "added" : "updated"}</em>
        </dd>
      ) : (
        milestoneReportsJSX
      )}
    </>
  );
};

export default ProjectMilestoneReportFormSummary;
