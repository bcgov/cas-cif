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

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

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
        id
        summaryProjectSummaryFormChanges: formChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Project Summary Report"
          first: 1000
        ) @connection(key: "connection_summaryProjectSummaryFormChanges") {
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
      }
    `,
    projectRevision
  );

  // Show diff if it is not the first revision and the view only
  const renderDiff = !isFirstRevision && !viewOnly;

  // Show archived records if showing the diff
  let projectSummaryFormChanges = summaryProjectSummaryFormChanges.edges;
  if (!renderDiff)
    projectSummaryFormChanges = summaryProjectSummaryFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  const allFormChangesPristine = useMemo(
    () =>
      !projectSummaryFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [projectSummaryFormChanges]
  );

  const projectSummaryReportJSX = useMemo(() => {
    return projectSummaryFormChanges.map(({ node }) => {
      const projectSummaryFormDiffObject = renderDiff
        ? getFilteredSchema(
            node.formByJsonSchemaName.jsonSchema.schema as JSONSchema7,
            node || {}
          )
        : {
            formSchema: node.formByJsonSchemaName.jsonSchema.schema,
            formData: node.newFormData,
          };

      if (
        isOnAmendmentsAndOtherRevisionsPage &&
        node?.isPristine &&
        node.operation !== "ARCHIVE"
      )
        return null;

      return (
        <div key={node.id} className="reportContainer">
          {Object.keys(projectSummaryFormDiffObject.formSchema.properties)
            .length === 0 &&
            node.operation !== "ARCHIVE" && (
              <FormNotAddedOrUpdated
                isFirstRevision={isFirstRevision}
                formTitle="Project Summary Report"
              />
            )}
          {renderDiff && node.operation === "ARCHIVE" ? (
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Project Summary Report"
            />
          ) : (
            <FormBase
              liveValidate
              key={`form-${node.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={projectSummaryFormDiffObject.formSchema as JSONSchema7}
              formData={projectSummaryFormDiffObject.formData}
              uiSchema={projectSummaryReportUiSchema}
              formContext={{
                operation: node.operation,
                oldData: node.formChangeByPreviousFormChangeId?.newFormData,
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
    projectSummaryFormChanges,
  ]);

  useEffect(
    () => setHasDiff && setHasDiff(!allFormChangesPristine),
    [allFormChangesPristine, setHasDiff]
  );

  return (
    <>
      {!isOnAmendmentsAndOtherRevisionsPage && <h3>Project Summary Report</h3>}
      {projectSummaryFormChanges.length < 1 && viewOnly && (
        <dd>
          <em>No Project Summary Report</em>
        </dd>
      )}
      {allFormChangesPristine &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Project Summary Report"
        />
      ) : (
        projectSummaryReportJSX
      )}
    </>
  );
};

export default ProjectSummaryReportFormSummary;
