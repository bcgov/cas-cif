import { utils } from "@rjsf/core";
import {
  projectSummaryReportSchema,
  projectSummaryReportUiSchema,
} from "data/jsonSchemaForm/projectSummaryReportSchema";
import { JSONSchema7 } from "json-schema";
import FormBase from "./FormBase";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import { ProjectSummaryReportFormSummary_projectRevision$key } from "__generated__/ProjectSummaryReportFormSummary_projectRevision.graphql";
import { graphql, useFragment } from "react-relay";
import { SummaryFormProps } from "data/formPages/types";
import { useEffect, useMemo } from "react";
import { getSortedReports } from "./Functions/reportingRequirementFormChangeFunctions";
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

  // Show diff if it is not the first revision and the view only
  const renderDiff = !isFirstRevision && !viewOnly;

  // Show archived records if showing the diff
  let projectSummaryFormChanges = summaryProjectSummaryFormChanges.edges;
  if (!renderDiff)
    projectSummaryFormChanges = summaryProjectSummaryFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  // Sort form changes by the reporting requirement index
  const [sortedProjectSummaryReports] = useMemo(() => {
    return getSortedReports(projectSummaryFormChanges, true);
  }, [projectSummaryFormChanges]);

  const allFormChangesPristine = useMemo(
    () =>
      !projectSummaryFormChanges.some(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [projectSummaryFormChanges]
  );

  const projectSummaryReportsJSX = useMemo(() => {
    // TODO: There should just be one report ya?
    return sortedProjectSummaryReports.map((projectSummaryReport, index) => {
      const projectSummaryFormDiffObject = renderDiff
        ? getFilteredSchema(
            projectSummaryReportSchema as JSONSchema7,
            projectSummaryReport || {}
          )
        : {
            formSchema: projectSummaryReportSchema,
            formData: projectSummaryReport.newFormData,
          };

      if (
        isOnAmendmentsAndOtherRevisionsPage &&
        projectSummaryReport?.isPristine &&
        projectSummaryReport.operation !== "ARCHIVE"
      )
        return null;

      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Project Summary Report</h4>
          </header>
          {/* Show this part if none of Annual report form properties have been updated */}
          {Object.keys(projectSummaryFormDiffObject.formSchema.properties)
            .length === 0 &&
            projectSummaryReport.operation !== "ARCHIVE" && (
              <FormNotAddedOrUpdated
                isFirstRevision={isFirstRevision}
                formTitle="Project Summary Report"
              />
            )}
          {/* Show this part if the whole Annual report has been removed */}
          {renderDiff && projectSummaryReport.operation === "ARCHIVE" ? (
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Annual Report"
            />
          ) : (
            <FormBase
              liveValidate
              key={`form-${projectSummaryReport.id}`}
              tagName={"dl"}
              theme={readOnlyTheme}
              fields={renderDiff ? customFields : fields}
              schema={projectSummaryFormDiffObject.formSchema as JSONSchema7}
              formData={projectSummaryFormDiffObject.formData}
              uiSchema={projectSummaryReportUiSchema}
              formContext={{
                operation: projectSummaryReport.operation,
                oldData:
                  projectSummaryReport.formChangeByPreviousFormChangeId
                    ?.newFormData,
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
    sortedProjectSummaryReports,
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
        projectSummaryReportsJSX
      )}
    </>
  );
};

export default ProjectSummaryReportFormSummary;
