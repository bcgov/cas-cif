import { utils } from "@rjsf/core";
import { projectSummaryReportUiSchema } from "data/jsonSchemaForm/projectSummaryReportUISchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { ProjectSummaryReportFormSummary_projectRevision$key } from "__generated__/ProjectSummaryReportFormSummary_projectRevision.graphql";
import { graphql, useFragment } from "react-relay";
import { SummaryFormProps } from "data/formPages/types";
import { useEffect, useMemo } from "react";
import { getFilteredSchema } from "lib/theme/schemaFilteringHelpers";
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";

const { fields } = utils.getDefaultRegistry();

interface Props
  extends SummaryFormProps<ProjectSummaryReportFormSummary_projectRevision$key> {}

const ProjectSummaryReportFormSummary: React.FC<Props> = ({
  projectRevision,
  viewOnly,
  isOnAmendmentsAndOtherRevisionsPage,
  setHasDiff,
  query,
}) => {
  const { projectSummaryReportFormBySlug } = useFragment(
    graphql`
      fragment ProjectSummaryReportFormSummary_query on Query {
        projectSummaryReportFormBySlug: formBySlug(
          slug: "project_summary_report"
        ) {
          jsonSchema
        }
      }
    `,
    query
  );

  const {
    summaryProjectSummaryFormChanges,
    isFirstRevision,
    latestCommittedProjectSummaryFormChanges,
  } = useFragment(
    graphql`
      fragment ProjectSummaryReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        summaryProjectSummaryFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Project Summary Report"
          first: 1
        ) @connection(key: "connection_summaryProjectSummaryFormChanges") {
          edges {
            node {
              newFormData
              operation
              formChangeByPreviousFormChangeId {
                newFormData
              }
            }
          }
        }
        latestCommittedProjectSummaryFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Project Summary Report"
          first: 1
        )
          @connection(
            key: "connection_latestCommittedProjectSummaryFormChanges"
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

  // Show diff if it is not the first revision and the view only
  const renderDiff = !isFirstRevision && !viewOnly;

  const projectSummaryReport = summaryProjectSummaryFormChanges?.edges[0]?.node;

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  const filteredSchema = getFilteredSchema(
    projectSummaryReportFormBySlug.jsonSchema.schema as JSONSchema7,
    projectSummaryReport || {}
  );

  const allFormChangesPristine = useMemo(
    () => Object.keys(filteredSchema.formData).length === 0,
    [filteredSchema.formData]
  );

  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  // Set the formSchema and formData based on showing the diff or not
  const projectSummaryFormDiffObject = !renderDiff
    ? {
        formSchema: projectSummaryReportFormBySlug.jsonSchema.schema,
        formData: projectSummaryReport?.newFormData,
      }
    : filteredSchema;
  if ((allFormChangesPristine && !viewOnly) || !projectSummaryReport)
    return (
      <>
        {!isOnAmendmentsAndOtherRevisionsPage && (
          <h3>Project Summary Report</h3>
        )}
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Summary Report"
        />
      </>
    );

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Summary Report</h3>}
      {allFormChangesPristine &&
        !viewOnly &&
        projectSummaryReport?.operation !== "ARCHIVE" && (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Project Summary Report"
          />
        )}
      {renderDiff && projectSummaryReport?.operation === "ARCHIVE" && (
        <FormRemoved
          isOnAmendmentsAndOtherRevisionsPage={
            isOnAmendmentsAndOtherRevisionsPage
          }
          formTitle="Project Summary Report"
        />
      )}
      <FormBase
        liveValidate
        tagName={"dl"}
        theme={readOnlyTheme}
        fields={renderDiff ? customFields : fields}
        schema={projectSummaryFormDiffObject.formSchema as JSONSchema7}
        formData={projectSummaryFormDiffObject.formData}
        uiSchema={projectSummaryReportUiSchema}
        formContext={{
          operation: projectSummaryReport.operation,
          oldData:
            projectSummaryReport.formChangeByPreviousFormChangeId?.newFormData,
          latestCommittedData:
            latestCommittedProjectSummaryFormChanges?.edges[0]?.node
              ?.newFormData,
          isAmendmentsAndOtherRevisionsSpecific:
            isOnAmendmentsAndOtherRevisionsPage,
        }}
      />
    </>
  );
};

export default ProjectSummaryReportFormSummary;
