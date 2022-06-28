import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import type { JSONSchema7 } from "json-schema";

import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { utils } from "@rjsf/core";
import { ProjectMilestoneReportFormSummary_projectRevision$key } from "__generated__/ProjectMilestoneReportFormSummary_projectRevision.graphql";
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
import {
  // milestoneReportingRequirementUiSchema,
  milestoneReportingRequirementSchema,
  milestoneSchema,
  // milestoneUiSchema,
} from "data/jsonSchemaForm/projectMilestoneSchema";
import { getConsolidatedMilestoneFormData } from "./Functions/projectMilestoneFormFunctions";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectMilestoneReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}
// const milestoneReportUiSchema = {
//   reportDueDate: {
//     "ui:widget": "DueDateWidget",
//   },
//   submittedDate: {
//     "ui:widget": "ReceivedDateWidget",
//   },
//   comments: {
//     "ui:widget": "TextAreaWidget",
//   },
// };

const ProjectMilestoneReportFormSummary: React.FC<Props> = (props) => {
  const {
    summaryMilestoneReportingRequirementFormChanges,
    summaryMilestoneFormChanges,
    summaryMilestonePaymentFormChanges,
    isFirstRevision,
  } = useFragment(
    graphql`
      fragment ProjectMilestoneReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryMilestoneReportingRequirementFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        )
          @connection(
            key: "connection_summaryMilestoneReportingRequirementFormChanges"
          ) {
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
            }
          }
        }
        summaryMilestoneFormChanges: formChangesFor(
          formDataTableName: "milestone_report"
          first: 1000
        ) @connection(key: "connection_summaryMilestoneFormChanges") {
          edges {
            # eslint-disable-next-line relay/unused-fields
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
        summaryMilestonePaymentFormChanges: formChangesFor(
          formDataTableName: "payment"
          first: 1000
        ) @connection(key: "connection_summaryMilestonePaymentFormChanges") {
          edges {
            # eslint-disable-next-line relay/unused-fields
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

  console.log(
    "reporting requirement: ",
    summaryMilestoneReportingRequirementFormChanges,
    "milestone: ",
    summaryMilestoneFormChanges,
    "payment: ",
    summaryMilestonePaymentFormChanges
  );

  const consolidatedFormData = useMemo(() => {
    return getConsolidatedMilestoneFormData(
      summaryMilestoneReportingRequirementFormChanges.edges,
      summaryMilestoneFormChanges.edges,
      summaryMilestonePaymentFormChanges.edges
    );
  }, [
    summaryMilestoneFormChanges.edges,
    summaryMilestonePaymentFormChanges.edges,
    summaryMilestoneReportingRequirementFormChanges.edges,
  ]);

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived milestone reports
  let milestoneReportFormChanges = consolidatedFormData;
  if (!renderDiff)
    milestoneReportFormChanges = consolidatedFormData.filter(
      (formChange) =>
        formChange.reportingRequirementFormChange.operation !== "ARCHIVE"
    );

  // Sort consolidated milestone form change records
  const [sortedMilestoneReports] = useMemo(() => {
    const filteredReports = milestoneReportFormChanges
      .map((formData) => formData)
      .filter((report) => report.operation !== "ARCHIVE");

    filteredReports.sort(
      (a, b) => a.reportingRequirementIndex - b.reportingRequirementIndex
    );
    const nextIndex =
      filteredReports.length > 0
        ? filteredReports[filteredReports.length - 1]
            .reportingRequirementIndex + 1
        : 1;

    return [filteredReports, nextIndex];
  }, [milestoneReportFormChanges]);

  const allFormChangesPristine = useMemo(
    () =>
      !milestoneReportFormChanges.some(
        (report) =>
          (report?.reportingRequirementFormChange.isPristine === false &&
            report?.milestoneFormChange.isPristine === false &&
            report?.paymentFormChange.isPristine === false) ||
          (report?.reportingRequirementFormChange.isPristine === null &&
            report?.milestoneFormChange.isPristine === null &&
            report?.paymentFormChange.isPristine === null)
      ),
    [milestoneReportFormChanges]
  );

  const milestoneReportsJSX = useMemo(() => {
    return sortedMilestoneReports.map((milestoneReport, index) => {
      if (!milestoneReport) return;

      // Set the formSchema and formData based on showing the diff or not
      const { reportingRequirementFormSchema, reportingRequirementFormData } =
        !renderDiff
          ? {
              reportingRequirementFormSchema:
                milestoneReportingRequirementSchema,
              reportingRequirementFormData:
                milestoneReport.reportingRequirementFormChange.newFormData,
            }
          : (getFilteredSchema(
              milestoneReportingRequirementSchema as JSONSchema7,
              milestoneReport.reportingRequirement
            ) as any);

      const { milestoneFormSchema, milestoneFormData } = !renderDiff
        ? {
            milestoneFormSchema: milestoneSchema,
            milestoneFormData: milestoneReport.milestoneFormChange.newFormData,
          }
        : (getFilteredSchema(
            milestoneSchema as JSONSchema7,
            milestoneReport.milestone
          ) as any);

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Milestone Report {index + 1}</h4>
          </header>
          {/* Show this part if none of milestone report form properties have been updated */}
          {Object.keys(reportingRequirementFormSchema.properties).length ===
            0 &&
            Object.keys(milestoneFormSchema.properties).length === 0 &&
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
            schema={reportingRequirementFormSchema as JSONSchema7}
            // uiSchema={milestoneReportUiSchema}
            formData={reportingRequirementFormData}
            formContext={{
              operation: milestoneReport.operation,
              oldData:
                milestoneReport.reportingRequirementFormChange
                  .formChangeByPreviousFormChangeId?.newFormData,
            }}
          />
          <FormBase
            liveValidate
            key={`form-${milestoneReport.id}`}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={milestoneFormSchema as JSONSchema7}
            // uiSchema={milestoneReportUiSchema}
            formData={milestoneFormData}
            formContext={{
              operation: milestoneReport.operation,
              oldData:
                milestoneReport.milestoneFormChange
                  .formChangeByPreviousFormChangeId?.newFormData,
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
