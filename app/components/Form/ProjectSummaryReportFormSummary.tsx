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
import { getFilteredSchema } from "lib/theme/getFilteredSchema";
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
}) => {
  const { summaryProjectSummaryFormChanges, isFirstRevision } = useFragment(
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

  // Show diff if it is not the first revision and the view only
  const renderDiff = !isFirstRevision && !viewOnly;

  const projectSummaryFormChange =
    summaryProjectSummaryFormChanges?.edges[0]?.node;

  // Set custom rjsf fields to display diffs
  const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

  const allFormChangesPristine = useMemo(() => {
    if (
      projectSummaryFormChange?.isPristine === false ||
      projectSummaryFormChange?.isPristine === null
    )
      return false;
    return true;
  }, [projectSummaryFormChange?.isPristine]);

  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  if (allFormChangesPristine || !projectSummaryFormChange)
    return (
      <>
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Summary Report"
        />
      </>
    );

  // Set the formSchema and formData based on showing the diff or not
  const projectSummaryFormDiffObject = renderDiff
    ? getFilteredSchema(
        projectSummaryFormChange.formByJsonSchemaName.jsonSchema
          .schema as JSONSchema7,
        projectSummaryFormChange || {}
      )
    : {
        formSchema:
          projectSummaryFormChange.formByJsonSchemaName.jsonSchema.schema,
        formData: projectSummaryFormChange.newFormData,
      };

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Summary Report</h3>}
      {allFormChangesPristine &&
        projectSummaryFormChange?.operation !== "ARCHIVE" && (
          <FormNotAddedOrUpdated
            isFirstRevision={isFirstRevision}
            formTitle="Project Summary Report"
          />
        )}
      {renderDiff && projectSummaryFormChange?.operation === "ARCHIVE" && (
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
          operation: projectSummaryFormChange.operation,
          oldData:
            projectSummaryFormChange.formChangeByPreviousFormChangeId
              ?.newFormData,
          isAmendmentsAndOtherRevisionsSpecific:
            isOnAmendmentsAndOtherRevisionsPage,
        }}
      />
    </>
  );
};

export default ProjectSummaryReportFormSummary;
