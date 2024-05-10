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
import {
  FormNotAddedOrUpdated,
  FormRemoved,
} from "./SummaryFormCommonComponents";

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
  const {
    summaryMilestoneFormChanges,
    isFirstRevision,
    latestCommittedMilestoneFormChanges,
  } = useFragment(
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
              formByJsonSchemaName {
                jsonSchema
              }
            }
          }
        }
        latestCommittedMilestoneFormChanges: latestCommittedFormChangesFor(
          formDataTableName: "reporting_requirement"
          reportType: "Milestone"
          first: 1000
        ) @connection(key: "connection_latestCommittedMilestoneFormChanges") {
          edges {
            # eslint-disable-next-line relay/unused-fields
            node {
              newFormData
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
            {
              ...(milestoneReport.formByJsonSchemaName.jsonSchema
                .schema as JSONSchema7),
              properties: {
                ...(
                  milestoneReport.formByJsonSchemaName.jsonSchema
                    .schema as JSONSchema7
                ).properties,
                ...(milestoneReport.newFormData.calculatedHoldbackAmount !==
                null
                  ? {
                      calculatedHoldbackAmount: {
                        title: "Holdback Amount This Milestone",
                        type: "number",
                      },
                    }
                  : {}),
                ...(milestoneReport.newFormData.calculatedGrossAmount !== null
                  ? {
                      calculatedGrossAmount: {
                        title: "Gross Payment Amount This Milestone",
                        type: "number",
                      },
                    }
                  : {}),
                ...(milestoneReport.newFormData.calculatedNetAmount !== null
                  ? {
                      calculatedNetAmount: {
                        title: "Net Payment Amount This Milestone",
                        type: "number",
                      },
                    }
                  : {}),
              },
            },
            {
              ...milestoneReport,
            }
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

      const latestCommittedData =
        latestCommittedMilestoneFormChanges?.edges?.find(
          (latestCommittedNode) => {
            return (
              latestCommittedNode.node.newFormData.reportingRequirementIndex ===
              milestoneReport.newFormData.reportingRequirementIndex
            );
          }
        )?.node?.newFormData;

      const updatedUiSchema = {
        ...projectMilestoneUiSchema,
        calculatedHoldbackAmount: {
          "ui:widget": "NumberWidget",
          hideOptional: true,
          isMoney: true,
        },
        calculatedGrossAmount: {
          "ui:widget": "NumberWidget",
          hideOptional: true,
          isMoney: true,
        },
        calculatedNetAmount: {
          "ui:widget": "NumberWidget",
          hideOptional: true,
          isMoney: true,
        },
      };

      // Clone milestoneFormDiffObject and overwrite the titles
      const titleMap = {
        adjustedGrossAmount: "Gross Payment Amount This Milestone (Adjusted)",
        adjustedNetAmount: "Net Payment Amount This Milestone (Adjusted)",
        adjustedHoldbackAmount: "Holdback Amount This Milestone (Adjusted)",
      };
      const clonedMilestoneFormDiffObject = JSON.parse(
        JSON.stringify(milestoneFormDiffObject)
      );
      Object.entries(titleMap).forEach(([key, title]) => {
        if (
          clonedMilestoneFormDiffObject.formData[key] !== null &&
          clonedMilestoneFormDiffObject.formSchema.properties[key]
        ) {
          clonedMilestoneFormDiffObject.formSchema.properties[key].title =
            title;
        }
      });
      return (
        <div key={index} className="reportContainer">
          <header>
            <h4>Milestone Report {index + 1}</h4>
          </header>
          {/* Show this part if none of milestone report form properties have been updated */}
          {Object.keys(milestoneFormDiffObject.formSchema.properties).length ===
            0 &&
            milestoneReport.operation !== "ARCHIVE" && (
              <FormNotAddedOrUpdated
                isFirstRevision={isFirstRevision}
                formTitle="Milestone Report"
              />
            )}

          {/* Show this part if the whole milestone report has been removed */}
          {renderDiff && milestoneReport.operation === "ARCHIVE" && (
            <FormRemoved
              isOnAmendmentsAndOtherRevisionsPage={
                isOnAmendmentsAndOtherRevisionsPage
              }
              formTitle="Milestone Report"
            />
          )}
          <FormBase
            key={`form-${milestoneReport.id}`}
            tagName={"dl"}
            theme={readOnlyTheme}
            fields={renderDiff ? customFields : fields}
            schema={clonedMilestoneFormDiffObject.formSchema as JSONSchema7}
            uiSchema={updatedUiSchema}
            formData={milestoneFormDiffObject.formData}
            formContext={{
              calculatedHoldbackAmount:
                milestoneReport?.newFormData?.calculatedHoldbackAmount,
              calculatedGrossAmount:
                milestoneReport?.newFormData?.calculatedGrossAmount,
              calculatedNetAmount:
                milestoneReport?.newFormData?.calculatedNetAmount,
              operation: milestoneReport.operation,
              latestCommittedData,
              isAmendmentsAndOtherRevisionsSpecific:
                isOnAmendmentsAndOtherRevisionsPage,
            }}
          />
          <style jsx>{`
            div.reportContainer {
              padding-top: 1em;
            }
            :global(.adjustable-calculated-value-widget) {
              display: flex;
              flex-wrap: wrap;
            }
          `}</style>
        </div>
      );
    });
  }, [
    isFirstRevision,
    isOnAmendmentsAndOtherRevisionsPage,
    latestCommittedMilestoneFormChanges?.edges,
    renderDiff,
    sortedMilestoneReports,
  ]);

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
        <FormNotAddedOrUpdated
          isFirstRevision={true} //setting this to true so that the text is "Milestone Reports not added"
          formTitle="Milestone Reports"
        />
      )}
      {(allFormChangesPristine || milestoneReportFormChanges.length < 1) &&
      !viewOnly &&
      !isOnAmendmentsAndOtherRevisionsPage ? (
        <FormNotAddedOrUpdated
          isFirstRevision={isFirstRevision}
          formTitle="Milestone Reports"
        />
      ) : (
        milestoneReportsJSX
      )}
    </>
  );
};

export default ProjectMilestoneReportFormSummary;
