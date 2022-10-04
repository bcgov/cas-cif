import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { ProjectMilestoneReportFormSummary_projectRevision$key } from "__generated__/ProjectMilestoneReportFormSummary_projectRevision.graphql";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import projectMilestoneUiSchema from "data/jsonSchemaForm/projectMilestoneUiSchema";
import { getSortedReports } from "./Functions/reportingRequirementFormChangeFunctions";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectMilestoneReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectMilestoneReportFormSummary: React.FC<Props> = (props) => {
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
    props.projectRevision
  );

  const renderDiff = !isFirstRevision && !props.viewOnly;

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
      const reportingRequirementFormDiffObject = renderDiff
        ? (getFilteredSchema(
            milestoneReport.formByJsonSchemaName.jsonSchema
              .schema as JSONSchema7,
            milestoneReport
          ) as any)
        : {
            formSchema: milestoneReport.formByJsonSchemaName.jsonSchema.schema,
            formData: milestoneReport.newFormData,
          };

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Milestone Report {index + 1}</h4>
          </header>
          {/* Show this part if none of milestone report form properties have been updated */}
          {Object.keys(reportingRequirementFormDiffObject.formSchema.properties)
            .length === 0 &&
            milestoneReport.operation !== "ARCHIVE" && (
              <em>Milestone report not updated</em>
            )}

          {/* Show this part if the whole milestone report has been removed */}
          {renderDiff && milestoneReport.operation === "ARCHIVE" && (
            <em className="diffOld">Milestone Report Removed</em>
          )}
          <FormBase
            key={`form-${milestoneReport.id}`}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={
              reportingRequirementFormDiffObject.formSchema as JSONSchema7
            }
            uiSchema={projectMilestoneUiSchema}
            formData={reportingRequirementFormDiffObject.formData}
            formContext={{
              operation: milestoneReport.operation,
              oldData:
                milestoneReport.formChangeByPreviousFormChangeId?.newFormData,
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
  }, [sortedMilestoneReports, renderDiff]);

  return (
    <>
      <h3>Project Milestone Reports</h3>
      {milestoneReportFormChanges.length < 1 && props.viewOnly && (
        <dd>
          <em>No Milestone Reports</em>
        </dd>
      )}
      {(allFormChangesPristine || milestoneReportFormChanges.length < 1) &&
      !props.viewOnly ? (
        <dd>
          <em>Milestone reports not {isFirstRevision ? "added" : "updated"}</em>
        </dd>
      ) : (
        milestoneReportsJSX
      )}
    </>
  );
};

export default ProjectMilestoneReportFormSummary;
