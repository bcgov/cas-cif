import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { ProjectMilestoneReportFormSummary_projectRevision$key } from "__generated__/ProjectMilestoneReportFormSummary_projectRevision.graphql";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import { projectMilestoneSchema } from "data/jsonSchemaForm/projectMilestoneSchema";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectMilestoneReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}
const milestoneReportUiSchema = {
  reportDueDate: {
    "ui:widget": "DueDateWidget",
  },
  submittedDate: {
    "ui:widget": "ReceivedDateWidget",
  },
  comments: {
    "ui:widget": "TextAreaWidget",
  },
};

const ProjectMilestoneReportFormSummary: React.FC<Props> = (props) => {
  const { summaryProjectMilestoneReportFormChanges, isFirstRevision } =
    useFragment(
      graphql`
        fragment ProjectMilestoneReportFormSummary_projectRevision on ProjectRevision {
          isFirstRevision
          summaryProjectMilestoneReportFormChanges: formChangesFor(
            formDataTableName: "reporting_requirement"
            reportType: "Milestone"
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

  const renderDiff = !isFirstRevision && !props.viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived milestone reports
  let milestoneReportFormChanges =
    summaryProjectMilestoneReportFormChanges.edges;
  if (!renderDiff)
    milestoneReportFormChanges =
      summaryProjectMilestoneReportFormChanges.edges.filter(
        ({ node }) => node.operation !== "ARCHIVE"
      );

  // Sorting the milestone reports form changes by the reporting requirement index
  const [sortedMilestoneReports] = useMemo(() => {
    const filteredReports = milestoneReportFormChanges.map(({ node }) => node);

    filteredReports.sort(
      (a, b) =>
        a.newFormData.reportingRequirementIndex -
        b.newFormData.reportingRequirementIndex
    );

    return [filteredReports];
  }, [milestoneReportFormChanges]);

  const allFormChangesPristine = useMemo(
    () =>
      !milestoneReportFormChanges.some(
        ({ node }) => node?.isPristine === false || node?.isPristine === null
      ),
    [milestoneReportFormChanges]
  );

  const milestoneReportsJSX = useMemo(() => {
    return sortedMilestoneReports.map((milestoneReport, index) => {
      if (!milestoneReport) return;

      // Set the formSchema and formData based on showing the diff or not
      const { formSchema, formData } = !renderDiff
        ? {
            formSchema: projectMilestoneSchema,
            formData: milestoneReport.newFormData,
          }
        : getFilteredSchema(
            projectMilestoneSchema as JSONSchema7,
            milestoneReport
          );

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Milestone Report {index + 1}</h4>
          </header>
          {/* Show this part if none of milestone report form properties have been updated */}
          {Object.keys(formSchema.properties).length === 0 &&
            milestoneReport.operation !== "ARCHIVE" && (
              <em>Milestone report not updated</em>
            )}

          {/* Show this part if the whole milestone report has been removed */}
          {renderDiff && milestoneReport.operation === "ARCHIVE" && (
            <em className="diffOld">Milestone Report Removed</em>
          )}
          <FormBase
            liveValidate
            key={`form-${milestoneReport.id}`}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={formSchema as JSONSchema7}
            uiSchema={milestoneReportUiSchema}
            formData={formData}
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
