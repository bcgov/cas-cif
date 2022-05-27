import { utils } from "@rjsf/core";
import projectReportingRequirementSchema from "data/jsonSchemaForm/projectReportingRequirementSchema";
import { JSONSchema7 } from "json-schema";
import CUSTOM_DIFF_FIELDS from "lib/theme/CustomDiffFields";
import readOnlyTheme from "lib/theme/ReadOnlyTheme";
import { useMemo } from "react";
import { graphql, useFragment } from "react-relay";
import { ProjectAnnualReportFormSummary_projectRevision$key } from "__generated__/ProjectAnnualReportFormSummary_projectRevision.graphql";
import FormBase from "./FormBase";
import { annualReportUiSchema } from "./ProjectAnnualReportForm";

const { fields } = utils.getDefaultRegistry();

const customFields = { ...fields, ...CUSTOM_DIFF_FIELDS };

interface Props {
  projectRevision: ProjectAnnualReportFormSummary_projectRevision$key;
  viewOnly?: boolean;
}

const ProjectAnnualReportFormSummary: React.FC<Props> = (props) => {
  const { summaryAnnualReportFormChanges, isFirstRevision } = useFragment(
    graphql`
      fragment ProjectAnnualReportFormSummary_projectRevision on ProjectRevision {
        isFirstRevision
        id
        rowId
        summaryAnnualReportFormChanges: projectAnnualReportFormChanges {
          edges {
            node {
              rowId
              id
              isPristine
              newFormData
              operation
              changeStatus
              formChangeByPreviousFormChangeId {
                changeStatus
                newFormData
              }
            }
          }
        }
        projectFormChange {
          formDataRecordId
        }
      }
    `,
    props.projectRevision
  );

  // Show diff if it is not the first revision and not view only (rendered from the contacts page)
  const renderDiff = !isFirstRevision && !props.viewOnly;

  // If we are showing the diff then we want to see archived records, otherwise filter out the archived contacts
  let annualReportFormChanges = summaryAnnualReportFormChanges.edges;
  if (!renderDiff)
    annualReportFormChanges = summaryAnnualReportFormChanges.edges.filter(
      ({ node }) => node.operation !== "ARCHIVE"
    );

  const annualReports = useMemo(
    () =>
      annualReportFormChanges.filter(
        ({ node }) => node.isPristine === false || node.isPristine === null
      ),
    [annualReportFormChanges]
  );

  const allFormChangesPristine = useMemo(
    () =>
      !annualReportFormChanges.some(
        ({ node }) =>
          node.isPristine === false ||
          (node.isPristine === null && node.newFormData?.reportId !== null)
      ),
    [annualReportFormChanges]
  );

  const annualReportsJSX = useMemo(() => {
    return annualReports.map(({ node }) => {
      return (
        <FormBase
          liveValidate
          key={node.newFormData.reportIndex}
          tagName={"dl"}
          fields={renderDiff ? customFields : fields}
          theme={readOnlyTheme}
          schema={projectReportingRequirementSchema as JSONSchema7}
          uiSchema={annualReportUiSchema}
          formData={node.newFormData}
          formContext={{
            operation: node.operation,
            oldData: node.formChangeByPreviousFormChangeId?.newFormData,
            // will need to use new/old schemas
            oldUiSchema: annualReportUiSchema,
          }}
        />
      );
    });
  }, [annualReports, renderDiff]);

  return (
    <>
      <h3>Project Annual Reports</h3>
      {allFormChangesPristine && !props.viewOnly ? (
        <p>
          <em>
            Project annual reports not {isFirstRevision ? "added" : "updated"}
          </em>
        </p>
      ) : (
        annualReportsJSX
      )}
    </>
  );
};

export default ProjectAnnualReportFormSummary;
